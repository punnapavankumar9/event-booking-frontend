import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventInfo, ScheduledEvent } from '../../types';
import { ToastService } from '../../../core/services/toast.service'; // Adjust path as needed

@Component({
  selector: 'app-event-scheduler',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-scheduler.component.html',
  styleUrls: ['./event-scheduler.component.scss'],
})
export class EventSchedulerComponent implements OnInit {
  eventInfo = input.required<EventInfo>();
  submitEventInfo = output<ScheduledEvent[]>();
  form = new FormGroup({
    events: new FormArray([]),
  });
  toastService = inject(ToastService)

  get events(): FormArray<FormGroup<{
    date: FormControl<string | null>;
    shows: FormArray<FormGroup<{
      startDate: FormControl<string | null>;
      endDate: FormControl<string | null>;
      isOpenForBooking: FormControl<boolean>;
    }>>;
  }>> {
    return this.form.get('events') as FormArray;
  }

  getDayControls(): FormGroup<{
    date: FormControl<string | null>;
    shows: FormArray<FormGroup<{
      startDate: FormControl<string | null>;
      endDate: FormControl<string | null>;
      isOpenForBooking: FormControl<boolean>
    }>>;
  }>[] {
    return this.events.controls as FormGroup<{
      date: FormControl<string | null>;
      shows: FormArray<FormGroup<{
        startDate: FormControl<string | null>;
        endDate: FormControl<string | null>;
        isOpenForBooking: FormControl<boolean>
      }>>;
    }>[];
  }

  ngOnInit(): void {
    const startDate = this.eventInfo().startDate || new Date();
    this.events.push(this.eventsForDate(startDate));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Returns yyyy-MM-dd
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // Returns HH:mm
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return this.roundToNextFiveMinutes(this.formatTime(date));
  }

  eventsForDate(date: Date): FormGroup {
    return new FormGroup({
      date: new FormControl(this.formatDate(date), [Validators.required]),
      shows: new FormArray([this.emptyShowGroup()]),
    });
  }

  emptyShowGroup(initialStartTime?: string): FormGroup {
    const eventInfo = this.eventInfo();
    const baseDate = eventInfo?.startDate || new Date();
    const startTime = initialStartTime || this.formatTime(baseDate);
    const duration = eventInfo?.duration || 60;
    const endTime = this.addMinutes(startTime, duration);

    const showGroup = new FormGroup({
      startDate: new FormControl(startTime, [Validators.required]),
      isOpenForBooking: new FormControl(true, [Validators.required]),
      endDate: new FormControl({value: endTime, disabled: true}, [Validators.required]),
    });

    // Store initial value for delta calculation
    let previousStartTime = startTime;

    showGroup.controls.startDate.valueChanges.subscribe((newStartTime) => {
      if (newStartTime) {
        const delta = this.calculateTimeDelta(previousStartTime, newStartTime);
        previousStartTime = newStartTime; // Update previous for next change
        const newEndTime = this.addMinutes(newStartTime, duration);
        showGroup.controls.endDate.setValue(newEndTime, {emitEvent: false});

        // Propagate delta to subsequent shows
        const day = showGroup.parent?.parent as FormGroup; // Get the day FormGroup
        if (day) {
          const shows = day.get('shows') as FormArray;
          const currentIndex = shows.controls.indexOf(showGroup);
          this.updateSubsequentShows(shows, currentIndex, delta);
        }
      }
    });

    return showGroup;
  }

  private roundToNextFiveMinutes(time: string): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    const remainder = date.getMinutes() % 5;
    if (remainder !== 0) {
      date.setMinutes(date.getMinutes() + (5 - remainder));
    }
    return this.formatTime(date);
  }

  addDay(): void {
    const prevDay = this.events.length ? this.events.at(this.events.length - 1).get('date')?.value : null;
    let newDay: Date;
    if (prevDay) {
      newDay = new Date(prevDay);
      newDay.setDate(newDay.getDate() + 1);
    } else {
      newDay = new Date(this.eventInfo().startDate || Date.now());
    }
    this.events.push(this.eventsForDate(newDay));
  }

  deleteAllEvents(): void {
    while (this.events.length > 0) {
      this.events.removeAt(0);
    }
  }

  private updateSubsequentShows(shows: FormArray, changedIndex: number, delta: number): void {
    for (let i = changedIndex + 1; i < shows.length; i++) {
      const currentShow = shows.at(i) as FormGroup;
      const prevShow = shows.at(i - 1) as FormGroup;
      const prevEndTime = prevShow.get('endDate')?.value as string;

      // New startTime = previous endTime + 5-min break + delta, rounded to 5
      const newStartTimeWithBreak = this.addMinutes(prevEndTime, 5); // Base with 5-min break
      const [baseHours, baseMins] = newStartTimeWithBreak.split(':').map(Number);
      const baseDate = new Date();
      baseDate.setHours(baseHours, baseMins, 0, 0);
      baseDate.setMinutes(baseDate.getMinutes() + delta);
      const newStartTime = this.roundToNextFiveMinutes(this.formatTime(baseDate));

      const duration = this.eventInfo().duration || 60;
      const newEndTime = this.addMinutes(newStartTime, duration);

      currentShow.patchValue({
        startDate: newStartTime,
        endDate: newEndTime,
      }, {emitEvent: false}); // Avoid infinite loop
    }
  }

  addShow(day: FormGroup): void {
    const shows = day.get('shows') as FormArray;
    let newStartTime: string;
    if (shows.length > 0) {
      const lastShow = shows.at(shows.length - 1) as FormGroup;
      const lastEndTime = lastShow.get('endDate')?.value as string;
      newStartTime = this.addMinutes(lastEndTime, 5); // Add 5-minute break, rounded
    } else {
      newStartTime = this.formatTime(this.eventInfo().startDate || new Date());
    }

    shows.push(this.emptyShowGroup(newStartTime));
  }

  private spansDifferentDates(currentDate: string, startTime: string, endTime: string): boolean {
    const startDateTime = new Date(`${currentDate}T${startTime}:00`);
    const endDateTime = new Date(`${currentDate}T${endTime}:00`);
    return endDateTime < startDateTime;
  }

  private calculateTimeDelta(oldTime: string, newTime: string): number {
    const [oldHours, oldMins] = oldTime.split(':').map(Number);
    const [newHours, newMins] = newTime.split(':').map(Number);
    const oldDate = new Date();
    const newDate = new Date();
    oldDate.setHours(oldHours, oldMins, 0, 0);
    newDate.setHours(newHours, newMins, 0, 0);
    return (newDate.getTime() - oldDate.getTime()) / (1000 * 60); // Difference in minutes
  }

  shouldDisableAddShow(day: FormGroup): boolean {
    const shows = day.get('shows') as FormArray;
    if (shows.length === 0) return false;

    const currentDate = day.get('date')?.value as string;
    const lastShow = shows.at(shows.length - 1) as FormGroup;
    const lastStartTime = lastShow.get('startDate')?.value as string;
    const lastEndTime = lastShow.get('endDate')?.value as string;
    return this.spansDifferentDates(currentDate, lastStartTime, lastEndTime);
  }

  deleteEvent(day: FormGroup, idx: number): void {
    (day.get('shows') as FormArray).removeAt(idx);
  }


  duplicateToNextDay(day: FormGroup): void {
    const currentDate = day.get('date')?.value as string;
    const shows = day.get('shows') as FormArray;

    // Calculate next day's date
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayFormatted = this.formatDate(nextDay);

    // Create a new event with duplicated shows
    const newShows = new FormArray([] as any);
    for (let i = 0; i < shows.length; i++) {
      const show = shows.at(i) as FormGroup;
      const startTime = show.get('startDate')?.value as string;
      const endTime = show.get('endDate')?.value as string;
      const isOpenForBooking = show.get('isOpenForBooking')?.value as boolean;
      const newShowGroup = new FormGroup({
        startDate: new FormControl(startTime, [Validators.required]),
        endDate: new FormControl({value: endTime, disabled: true}, [Validators.required]),
        isOpenForBooking: new FormControl(isOpenForBooking, [Validators.required]),
      });

      // Subscribe to startDate changes for the new show
      newShowGroup.controls.startDate.valueChanges.subscribe((newStartTime) => {
        if (newStartTime) {
          const duration = this.eventInfo().duration || 60;
          const newEndTime = this.addMinutes(newStartTime, duration);
          newShowGroup.controls.endDate.setValue(newEndTime, {emitEvent: false});

          const parentDay = newShowGroup.parent?.parent as FormGroup;
          if (parentDay) {
            const parentShows = parentDay.get('shows') as FormArray;
            const currentIndex = parentShows.controls.indexOf(newShowGroup);
            this.updateSubsequentShows(parentShows, currentIndex, this.calculateTimeDelta(startTime, newStartTime));
          }
        }
      });

      newShows.push(newShowGroup);
    }

    // Check overlap between current day's last show and new day's first show
    if (shows.length > 0 && newShows.length > 0) {
      const lastCurrentShow = shows.at(shows.length - 1) as FormGroup;
      const lastCurrentEndTime = lastCurrentShow.get('endDate')?.value as string;
      const firstNewShow = newShows.at(0) as FormGroup;
      const firstNewStartTime = firstNewShow.get('startDate')?.value as string;

      const lastEndDateTime = new Date(`${currentDate}T${lastCurrentEndTime}:00`);
      const firstStartDateTime = new Date(`${nextDayFormatted}T${firstNewStartTime}:00`);

      // If last show's end time crosses midnight and overlaps with first new show's start time
      if (lastEndDateTime > new Date(`${currentDate}T23:59:59`) && lastEndDateTime >= firstStartDateTime) {
        newShows.removeAt(0); // Remove the first show from new day if it overlaps
      }
    }

    // Add the new event to the events FormArray
    this.events.push(new FormGroup({
      date: new FormControl(nextDayFormatted, [Validators.required]),
      shows: newShows,
    }));
  }


  validateEvents(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const dateSet = new Set<string>();
    const sortedEvents = this.events.controls.slice().sort((a, b) => {
      const dateA = a.get('date')?.value as string;
      const dateB = b.get('date')?.value as string;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    // Check for unique dates
    for (const event of sortedEvents) {
      const date = event.get('date')?.value as string;
      if (dateSet.has(date)) {
        errors.push(`Duplicate date found: ${date}`);
      } else {
        dateSet.add(date);
      }
    }

    for (let i = 0; i < sortedEvents.length; i++) {
      const currentEvent = sortedEvents[i];
      const currentDate = currentEvent.get('date')?.value as string;
      const shows = (currentEvent.get('shows') as FormArray).controls;

      // Check overlaps within the current day
      for (let j = 0; j < shows.length - 1; j++) {
        const currentShow = shows[j] as FormGroup;
        const nextShow = shows[j + 1] as FormGroup;
        const currentEndTime = currentShow.get('endDate')?.value as string;
        const nextStartTime = nextShow.get('startDate')?.value as string;

        const currentEndDateTime = new Date(`${currentDate}T${currentEndTime}:00`);
        const nextStartDateTime = new Date(`${currentDate}T${nextStartTime}:00`);

        if (currentEndDateTime > nextStartDateTime) {
          errors.push(`Overlap within ${currentDate}: Show ${j + 1} (${currentShow.get('startDate')?.value} - ${currentEndTime}) overlaps with Show ${j + 2} (${nextStartTime} - ${nextShow.get('endDate')?.value})`);
        }
      }

      // Check overlap between current day's last show and next day's first show
      if (i < sortedEvents.length - 1) {
        const nextEvent = sortedEvents[i + 1];
        const nextDate = nextEvent.get('date')?.value as string;
        const lastCurrentShow = shows[shows.length - 1] as FormGroup;
        const firstNextShow = (nextEvent.get('shows') as FormArray).at(0) as FormGroup;

        const lastCurrentEndTime = lastCurrentShow.get('endDate')?.value as string;
        const firstNextStartTime = firstNextShow.get('startDate')?.value as string;

        const lastEndDateTime = new Date(`${currentDate}T${lastCurrentEndTime}:00`);
        const firstNextStartDateTime = new Date(`${nextDate}T${firstNextStartTime}:00`);

        // Adjust lastEndDateTime if it crosses midnight
        if (lastEndDateTime > new Date(`${currentDate}T23:59:59`)) {
          lastEndDateTime.setDate(lastEndDateTime.getDate() + 1);
        }

        if (lastEndDateTime > firstNextStartDateTime) {
          errors.push(`Overlap between days: Last show of ${currentDate} (${lastCurrentShow.get('startDate')?.value} - ${lastCurrentEndTime}) overlaps with first show of ${nextDate} (${firstNextStartTime} - ${firstNextShow.get('endDate')?.value})`);
        }
      }
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  validationErrors: string[] = []; // Add property to store errors


  validateEventsAndSendToParent(): void {
    const validation = this.validateEvents();
    this.validationErrors = validation.errors;
    if (validation.isValid) {
      const events: ScheduledEvent[] = [];
      for (const control of this.events.controls) {
        const shows = control.getRawValue().shows ?? [];
        for (const show of shows) {
          events.push({
            ...this.getScheduledEventFromControl(control.value.date!, {
              startDate: show.startDate!,
              endDate: show.endDate!,
            }),
            isOpenForBooking: show.isOpenForBooking
          });
        }
      }
      this.submitEventInfo.emit(events);
    }
  }

  private getScheduledEventFromControl(date: string, show: { startDate: string, endDate: string }) {

    const event = {
      startDate: new Date(`${date}T${show.startDate}:00`),
      endDate: new Date(`${date}T${show.endDate}:00`),
    }
    if (event.startDate > event.endDate) {
      event.endDate.setDate(event.endDate.getDate() + 1);
    }
    return event;
  }
}
