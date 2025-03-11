import { Component, Input, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../types';
import { ToastService } from '../../../core/services/toast.service';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-existing-events',
  templateUrl: './existing-events.component.html',
  styleUrls: ['./existing-events.component.scss'],
  imports: [DatePipe],
  standalone: true
})
export class ExistingEventsComponent implements OnInit {
  @Input() eventId!: string;
  @Input() venueId!: string;
  eventsByDate: { [date: string]: Event[] } = {};
  datesWithEvents: Date[] = [];
  currentWeekStart: Date = new Date(); // Will be updated based on earliest event

  constructor(
    private eventService: EventService,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {
    if (this.eventId) {
      this.loadEvents();
    } else {
      this.toastService.showToast({ message: 'No event ID provided', type: 'error' });
    }
  }

  loadEvents() {
    this.eventService.findEventsByEventId(this.eventId, this.venueId).subscribe({
      next: (events: Event[]) => {
        if (events.length === 0) {
          this.toastService.showToast({
            message: 'No scheduled events found for this movie.',
            type: 'info'
          });
          return;
        }

        // Find the earliest startTime and set currentWeekStart to the Sunday of that week
        const startTimes = events
          .map(event => {
            // Parse the UTC ISO string and convert to local Date for sorting
            const startTime = new Date(event.eventDurationDetails.startTime);
            if (isNaN(startTime.getTime())) {
              console.error('Invalid startTime for event:', event);
              throw new Error('Invalid date format in event startTime');
            }
            // Ensure we use local time for sorting and grouping
            return new Date(startTime.toLocaleString()); // Convert UTC to local time
          })
          .sort((a, b) => a.getTime() - b.getTime());
        const earliestStartTime = startTimes[0];

        // Set currentWeekStart to the Sunday of the week of the earliest startTime (using local time)
        this.currentWeekStart = new Date(earliestStartTime);
        this.currentWeekStart.setHours(0, 0, 0, 0); // Reset to midnight local time
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - this.currentWeekStart.getDay()); // Set to Sunday of the week (local)

        // Group events by date (using startTime), ensuring local time consistency
        this.eventsByDate = {};
        events.forEach(event => {
          const startTime = new Date(event.eventDurationDetails.startTime); // Parsed as UTC
          if (isNaN(startTime.getTime())) {
            console.error('Invalid startTime for event:', event);
            throw new Error('Invalid date format in event startTime');
          }
          // Convert UTC to local time for grouping
          const localStartTime = new Date(startTime.toLocaleString());
          const date = this.formatDate(localStartTime); // Use local date for grouping
          if (!this.eventsByDate[date]) {
            this.eventsByDate[date] = [];
          }
          this.eventsByDate[date].push(event);
        });

        // Extract unique dates with events and filter based on current week
        this.updateDatesWithEvents();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.showToast({ message: err.message, type: 'error' });
      }
    });
  }

  private formatDate(date: Date): string {
    // Use local date formatting to ensure correct local date representation
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  hasEvents(date: Date): boolean {
    const dateStr = this.formatDate(date);
    return !!this.eventsByDate[dateStr];
  }

  getEventsForDate(date: Date): Event[] {
    const dateStr = this.formatDate(date);
    return this.eventsByDate[dateStr] || [];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  updateDatesWithEvents() {
    const start = new Date(this.currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Show 7 days (a week)

    this.datesWithEvents = Object.keys(this.eventsByDate)
      .map(dateStr => new Date(dateStr))
      .filter(date => date >= start && date <= end)
      .sort((a, b) => a.getTime() - b.getTime());
  }

  previousWeek() {
    const newWeekStart = new Date(this.currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);

    // Check if there are any events in the previous week
    const hasPreviousEvents = this.hasEventsInWeek(newWeekStart);
    if (hasPreviousEvents) {
      this.currentWeekStart = newWeekStart;
      this.updateDatesWithEvents();
    }
  }

  nextWeek() {
    const lastEventDate = Object.keys(this.eventsByDate)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!lastEventDate) return;
    const nextWeekStart = new Date(this.currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    if (lastEventDate.getTime() <= nextWeekStart.getTime()) {
      return; // No next week if no future events
    }
    this.currentWeekStart = nextWeekStart;
    this.updateDatesWithEvents();
  }

  hasNextWeek(): boolean {
    const lastEventDate = Object.keys(this.eventsByDate)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!lastEventDate) return false;
    const nextWeekStart = new Date(this.currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return lastEventDate.getTime() > nextWeekStart.getTime();
  }

  hasPreviousWeek(): boolean {
    const previousWeekStart = new Date(this.currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    return this.hasEventsInWeek(previousWeekStart);
  }

  private hasEventsInWeek(weekStart: Date): boolean {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Last day of the week (Saturday)

    return Object.keys(this.eventsByDate)
      .map(dateStr => new Date(dateStr))
      .some(date => date >= weekStart && date <= weekEnd);
  }

  private getEarliestEventDate(): Date {
    const earliestDateStr = Object.keys(this.eventsByDate)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return earliestDateStr || new Date();
  }
}
