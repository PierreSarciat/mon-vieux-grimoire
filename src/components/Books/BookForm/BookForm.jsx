/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { generateStarsInputs } from '../../../lib/functions';
import { useFilePreview } from '../../../lib/customHooks';
import addFileIMG from '../../../images/add_file.png';
import styles from './BookForm.module.css';
import { updateBook, addBook } from '../../../lib/common';

function BookForm({ book, validate }) {
  const userRating = book ? book.ratings.find((elt) => elt.userId === localStorage.getItem('userId'))?.grade : 0;

  const [rating, setRating] = useState(0);

  const navigate = useNavigate();
  const {
    register, watch, formState, handleSubmit, reset,
  } = useForm({
    defaultValues: useMemo(() => ({
      title: book?.title,
      author: book?.author,
      year: book?.year,
      genre: book?.genre,
    }), [book]),
  });
  useEffect(() => {
    reset(book);
  }, [book]);
  const file = watch(['file']);
  const [filePreview] = useFilePreview(file);

  useEffect(() => {
    setRating(userRating);
  }, [userRating]);

  useEffect(() => {
    if (!book && formState.dirtyFields.rating) {
      const rate = document.querySelector('input[name="rating"]:checked').value;
      setRating(parseInt(rate, 10));
      formState.dirtyFields.rating = false;
    }
  }, [formState]);

  const onSubmit = async (data) => {
    try {
      // 🔥 correction ici
      const fileInput =
        data.file && data.file.length > 0 ? data.file[0] : null;

      if (!book && !fileInput) {
        alert('Vous devez ajouter une image');
        return;
      }

      const formData = new FormData();

      if (fileInput) {
        formData.append('image', fileInput);
      }

      const bookData = {
        title: data.title,
        author: data.author,
        year: data.year,
        genre: data.genre,
        rating: data.rating || 0,
      };

      formData.append('thing', JSON.stringify(bookData));

      const newBook = await addBook(formData);

      if (!newBook.error) {
        validate(true);
      } else {
        alert(newBook.message);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du livre.');
    }
  };

  const readOnlyStars = !!book;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
      <input type="hidden" id="id" {...register('id')} />
      <label htmlFor="title">
        <p>Titre du livre</p>
        <input type="text" id="title" {...register('title')} />
      </label>
      <label htmlFor="author">
        <p>Auteur</p>
        <input type="text" id="author" {...register('author')} />
      </label>
      <label htmlFor="year">
        <p>Année de publication</p>
        <input type="text" id="year" {...register('year')} />
      </label>
      <label htmlFor="genre">
        <p>Genre</p>
        <input type="text" id="genre" {...register('genre')} />
      </label>
      <label htmlFor="rate">
        <p>Note</p>
        <div className={styles.Stars}>
          {generateStarsInputs(rating, register, readOnlyStars)}
        </div>
      </label>
      <label htmlFor="file">
        <p>Visuel</p>
        <div className={styles.AddImage}>
          {filePreview || book?.imageUrl ? (
            <>
              <img src={filePreview ?? book?.imageUrl} alt="preview" />
              <p>Modifier</p>
            </>
          ) : (
            <>
              <img src={addFileIMG} alt="Add file" />
              <p>Ajouter une image</p>
            </>
          )}

        </div>
        <input {...register('file')} type="file" id="file" accept="image/*" />
      </label>
      <button type="submit">Publier</button>
    </form>
  );
}

BookForm.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    userId: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    year: PropTypes.number,
    imageUrl: PropTypes.string,
    genre: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.string,
      grade: PropTypes.number,
    })),
    averageRating: PropTypes.number,
  }),
  validate: PropTypes.func,
};

BookForm.defaultProps = {
  book: null,
  validate: null,
};
export default BookForm;