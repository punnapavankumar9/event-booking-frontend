import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { MoviesService } from '../../services/movies.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-movie',
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './create-movie.component.html',
  styleUrl: './create-movie.component.scss'
})
export class CreateMovieComponent {
  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl('', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]),
    duration: new FormControl('', [Validators.required, Validators.min(11), Validators.max(600)]),
    tags: new FormArray([] as FormControl[]),
    genres: new FormArray([] as FormControl[]),
    releaseDate: new FormControl('', [Validators.required]),
    images: new FormControl('', [Validators.required, Validators.minLength(1)]),
    posterImage: new FormControl('', [Validators.required]),
  })

  constructor(private toastService: ToastService, private movieService: MoviesService, private router: Router) {
    this.addGenre();
    this.addTag();
  }

  selectedImages: File[] = [];
  posterImage: File | null = null;

  createMovie() {
    if (this.form.invalid) {
      this.toastService.showToast({message: "Invalid Form State", type: "error"})
      return;
    }
    const movieData = new FormData();
    const formValue = this.form.value;
    if (this.posterImage) {
      movieData.append("posterImage", this.posterImage);
    } else {
      this.toastService.showToast({message: "Please select a poster image", type: "error"})
    }
    if (this.selectedImages.length <= 0) {
      this.toastService.showToast({message: "Please select atleast one image", type: "error"})
    }
    this.selectedImages.forEach((file: File) => {
      movieData.append("images", file);
    });
    movieData.append("movie", JSON.stringify({
      title: formValue.title,
      description: formValue.description,
      duration: formValue.duration,
      tags: formValue.tags,
      genres: formValue.genres,
      releaseDate: new Date(formValue.releaseDate!).toISOString(),
    }));

    this.movieService.createMovie(movieData).subscribe({
      next: result => {
        this.toastService.showToast({message: "Movie created successfully", type: "success"});
        this.router.navigate(['/movies', 'details', result.id]);
      },
      error: error => {
        this.toastService.showToast({
          message: "Error creating Movie, Error: " + error.message,
          type: "error"
        });
      }
    })
  }

  removeGenre(index: number) {
    this.form.controls.genres.removeAt(index);
  }

  posterImageSelected(event: any) {
    if (event.target.files) {
      this.posterImage = event.target.files[0];
    }
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedImages = Array.from(event.target.files);
    }
  }


  addGenre() {
    this.form.controls.genres.push(new FormControl('', [Validators.required, Validators.minLength(2)]));
  }

  removeTag(i: number) {
    this.form.controls.tags.removeAt(i);
  }

  addTag() {
    this.form.controls.tags.push(new FormControl('', [Validators.required, Validators.minLength(2)]));
  }
}
