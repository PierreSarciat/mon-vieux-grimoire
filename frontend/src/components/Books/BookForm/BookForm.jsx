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
  const userGrade = book
    ? book.ratings.find((elt) => elt.userId === localStorage.getItem('userId'))?.grade
    : 0;

  const [grade, setGrade] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    watch,
    formState,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: useMemo(() => ({
      title: book?.title,
      author: book?.author,
      year: book?.year,
      genre: book?.genre,
      grade: userGrade || 0,
    }), [book, userGrade]),
  });

  useEffect(() => {
    reset(book);
  }, [book, reset]);

  // Surveillance du fichier image
  const watchedFile = watch('file'); // FileList ou undefined
  const [filePreview] = useFilePreview(watchedFile?.[0]); // premier fichier pour la preview

  // Initialise la note du user si le livre existe
  useEffect(() => {
    setGrade(userGrade);
  }, [userGrade]);

  // Met à jour la note quand l’utilisateur clique sur une étoile
  useEffect(() => {
    const selectedGrade = document.querySelector('input[name="grade"]:checked')?.value;
    if (selectedGrade) {
      setGrade(parseInt(selectedGrade, 10));
    }
  }, [formState.dirtyFields.grade]);

  const onSubmit = async (data) => {
    try {
      const fileInput = data.file && data.file.length > 0 ? data.file[0] : null;

      if (!book && !fileInput) {
        alert('Vous devez ajouter une image');
        return;
      }

      const formData = new FormData();

     /* const finalGrade = data.grade || grade || 0;*/

      const bookData = {
        title: data.title,
        author: data.author,
        year: data.year,
        genre: data.genre,
        grade: /*finalGrade,*/data.grade || grade || 0
      };


      formData.append('thing', JSON.stringify(bookData));

      if (fileInput) {
        formData.append('image', fileInput);
      }

      let response;
      if (book) {
        // Modification
        response = await updateBook(formData, book._id || book.id);
      } else {
        // Création
        response = await addBook(formData);
      }

      if (!response.error) {
        validate && validate(true);
      } else {
        alert(response.message);
      }
    } catch (err) {
      console.error(err);
      alert(book ? 'Erreur lors de la modification du livre.' : 'Erreur lors de la création du livre.');
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

      <label htmlFor="grade">
        <p>Note</p>
        <div className={styles.Stars}>
          {generateStarsInputs(grade, register, readOnlyStars)}
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
