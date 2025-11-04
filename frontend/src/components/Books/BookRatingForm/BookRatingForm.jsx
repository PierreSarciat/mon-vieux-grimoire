import * as PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './BookRatingForm.module.css';
import { generateStarsInputs, displayStars } from '../../../lib/functions';
import { APP_ROUTES } from '../../../utils/constants';
import { useUser } from '../../../lib/customHooks';
import { rateBook } from '../../../lib/common';

function BookRatingForm({ grade, setRating, userId, setBook, id, userRated }) {
  const { connectedUser, auth } = useUser();
  const navigate = useNavigate();

  const { register, handleSubmit, watch } = useForm({
    mode: 'onChange',
    defaultValues: { grade },
  });

  const watchedGrade = watch('grade', grade);

  useEffect(() => {
    setRating(Number(watchedGrade));
  }, [watchedGrade, setRating]);

 const onSubmit = async () => {
  if (!connectedUser || !auth) {
    navigate(APP_ROUTES.SIGN_IN);
    return;
  }

  const update = await rateBook(id, userId, watchedGrade);
  if (update) {
    // On ne met pas tout le livre à jour, juste les parties qui changent
    setRating(Number(watchedGrade));
    setBook((prev) => ({
      ...prev,
      ratings: update.ratings, // juste les notes
    }));
    if (update.averageRating) {
      setAverageRating(update.averageRating);
    }
  } else {
    alert('Erreur lors de l’enregistrement de la note.');
  }
};


  return (
    <div className={styles.BookRatingForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>{watchedGrade > 0 ? 'Votre Note' : 'Notez cet ouvrage'}</p>
        <div className={styles.Stars}>
          {!userRated
            ? generateStarsInputs(watchedGrade, register)
            : displayStars(watchedGrade)}
        </div>
        {!userRated && <button type="submit">Valider</button>}
      </form>
    </div>
  );
}

BookRatingForm.propTypes = {
  grade: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  setBook: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  userRated: PropTypes.bool.isRequired,
  setAverageRating: PropTypes.func.isRequired,
};

export default BookRatingForm;
