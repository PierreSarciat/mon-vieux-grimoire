import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../../lib/customHooks';
import styles from './Book.module.css';
import { getBook, deleteBook } from '../../lib/common';
import BookInfo from '../../components/Books/BookInfo/BookInfo';
import BookRatingForm from '../../components/Books/BookRatingForm/BookRatingForm';
import BookDeleteImage from '../../images/book_delete.png';
import BestRatedBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import BackArrow from '../../components/BackArrow/BackArrow';

function Book() {
  const { connectedUser, userLoading } = useUser();
  const [book, setBook] = useState(null);
  const [grade, setGrade] = useState(0);
  const [userRated, setUserRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0); // État pour la moyenne des notes
  const params = useParams();

  // Récupération du livre
  useEffect(() => {
    async function fetchBook() {
      const data = await getBook(params.id);
      if (data) {
        setBook(data);
        setAverageRating(data.averageRating || 0); // initialise la moyenne
      }
    }
    fetchBook();
  }, [params.id]);

  // Synchroniser grade et userRated après chargement du livre et de l'utilisateur
  useEffect(() => {
    if (!userLoading && book) {
      const ratings = book.ratings || [];
      const rate = connectedUser
        ? ratings.find((r) => r.userId === connectedUser.userId)
        : null;

      if (rate) {
        setUserRated(true);
        setGrade(Number(rate.grade));
      } else {
        setUserRated(false);
        setGrade(0);
      }
      setLoading(false);
    }
  }, [book, connectedUser, userLoading]);

  // Supprimer le livre
  const onDelete = async (e) => {
    if (e.key && e.key !== 'Enter') return;
    const check = window.confirm('Etes vous sûr de vouloir supprimer ce livre ?');
    if (check) {
      const del = await deleteBook(book.id);
      if (del) {
        setBook((oldValue) => ({ ...oldValue, delete: true }));
      }
    }
  };

  if (loading) return <h1>Chargement ...</h1>;

  if (book?.delete) {
    return (
      <div className={styles.Deleted}>
        <h1>{book.title}</h1>
        <p>a bien été supprimé</p>
        <img src={BookDeleteImage} alt={`Le livre ${book.title} a bien été supprimé`} />
        <Link to="/">
          <button type="button">Retour à l'accueil</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="content-container">
      <BackArrow />
      <div className={styles.BookContainer}>
        <div className={styles.Book}>
          <div
            className={styles.BookImage}
            style={{ backgroundImage: `url("${book.imageUrl}")` }}
          />
          <div className={styles.BookContent}>
            {book.userId === connectedUser?.userId && (
              <div className={styles.Owner}>
                <p>Vous avez publié cet ouvrage, vous pouvez le :</p>
                <p>
                  <Link to={`/livre/modifier/${book.id}`}>modifier</Link>{' '}
                  <span
                    tabIndex={0}
                    role="button"
                    onKeyUp={onDelete}
                    onClick={onDelete}
                  >
                    supprimer
                  </span>
                </p>
              </div>
            )}

            {/* BookInfo reçoit la moyenne */}
            <BookInfo book={{ ...book, averageRating }} />

            {/* BookRatingForm reçoit setAverageRating pour mise à jour partielle */}
            <BookRatingForm
              userRated={userRated}
              userId={connectedUser?.userId || ''}
              grade={grade}
              setRating={setGrade}
              setBook={setBook}
              setAverageRating={setAverageRating} // mise à jour de la moyenne
              id={book?._id || book?.id || ''}
            />
          </div>
        </div>
        <hr />
        <BestRatedBooks />
      </div>
    </div>
  );
}

export default Book;
