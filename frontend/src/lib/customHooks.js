import { useState, useEffect } from 'react';
import { getAuthenticatedUser, getBestRatedBooks } from './common';

/* -------------------------------------------
   Hook pour récupérer l’utilisateur connecté
-------------------------------------------- */
export function useUser() {
  const [connectedUser, setConnectedUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function getUserDetails() {
      try {
        const { authenticated, user } = await getAuthenticatedUser();
        setConnectedUser(user);
        setAuth(authenticated);
      } catch (err) {
        console.error('Erreur lors de la récupération de l’utilisateur :', err);
        setConnectedUser(null);
        setAuth(false);
      } finally {
        setUserLoading(false);
      }
    }
    getUserDetails();
  }, []);

  return { connectedUser, auth, userLoading };
}

/* -------------------------------------------
   Hook pour récupérer les livres les mieux notés
-------------------------------------------- */
export function useBestRatedBooks() {
  const [bestRatedBooks, setBestRatedBooks] = useState([]);

  useEffect(() => {
    async function getRatedBooks() {
      try {
        const books = await getBestRatedBooks();
        setBestRatedBooks(books);
      } catch (err) {
        console.error('Erreur lors de la récupération des livres :', err);
        setBestRatedBooks([]);
      }
    }
    getRatedBooks();
  }, []);

  return { bestRatedBooks };
}

/* -------------------------------------------
   Hook pour prévisualiser un fichier image
-------------------------------------------- */
export function useFilePreview(file) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (!file) {
      setImgSrc(null);
      return;
    }

    // Si file est un FileList (input type="file") ou un File direct
    const fileInput = file instanceof FileList ? file[0] : file;

    if (!fileInput) {
      setImgSrc(null);
      return;
    }

    // Crée un URL temporaire pour prévisualiser l’image
    const newUrl = URL.createObjectURL(fileInput);
    setImgSrc(newUrl);

    // Nettoyage à la désactivation du hook pour éviter les fuites mémoire
    return () => {
      URL.revokeObjectURL(newUrl);
    };
  }, [file]);

  return [imgSrc, setImgSrc];
}
