/* eslint-disable react/jsx-props-no-spreading */
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

  const params = useParams();

  useEffect(() => {
    async function fetchBook() {
      const data = await getBook(params.id);
      if (data) {
        setBook(data);
      }
    }
    fetchBook();
  }, [params.id]);

  // Synchroniser grade et userRated après chargement du book et connectedUser
  useEffect(() => {
  if (!userLoading && book) {
    // Protéger book.ratings au cas où il serait undefined
    const ratings = book.ratings || [];
    console.log('book.ratings:', ratings);
    const rate = connectedUser
      ? ratings.find((r) => r.userId === connectedUser.userId)
      : null;
    console.log('Note trouvée de l’utilisateur connecté:', rate);
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

  const onDelete = async (e) => {
    if (e.key && e.key !== 'Enter') return;
    // eslint-disable-next-line no-restricted-globals
    const check = confirm('Etes vous sûr de vouloir supprimer ce livre ?');
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
          <div className={styles.BookImage} style={{ backgroundImage: `url("${book.imageUrl}")` }} />
          <div className={styles.BookContent}>
            {book.userId === connectedUser?.userId && (
              <div className={styles.Owner}>
                <p>Vous avez publié cet ouvrage, vous pouvez le :</p>
                <p>
                  <Link to={`/livre/modifier/${book.id}`}>modifier</Link>{' '}
                  <span tabIndex={0} role="button" onKeyUp={onDelete} onClick={onDelete}>
                    supprimer
                  </span>
                </p>
              </div>
            )}

            <BookInfo book={book} />

            <BookRatingForm
              userRated={userRated}
              userId={connectedUser?.userId || ''}
              grade={grade}
              setRating={setGrade}
              setBook={setBook}
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
