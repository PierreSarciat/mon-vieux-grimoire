import axios from 'axios';
import { API_ROUTES } from '../utils/constants';

function formatBooks(bookArray) {
  return bookArray.map((book) => {
    const newBook = { ...book };
    // eslint-disable-next-line no-underscore-dangle
    newBook.id = newBook._id;
    return newBook;
  });
}

export function storeInLocalStorage(token, userId) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
}

export function getFromLocalStorage(item) {
  return localStorage.getItem(item);
}

export async function getAuthenticatedUser() {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = getFromLocalStorage('token');
    const userId = getFromLocalStorage('userId');
    if (!token) {
      return defaultReturnObject;
    }
    return { authenticated: true, user: { userId, token } };
  } catch (err) {
    console.error('getAuthenticatedUser, Something Went Wrong', err);
    return defaultReturnObject;
  }
}

export async function getBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}`,
    });
    // eslint-disable-next-line array-callback-return
    const books = formatBooks(response.data);
    return books;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getBook(id) {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}/${id}`,
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getBestRatedBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BEST_RATED}`,
    });
    return formatBooks(response.data);
  } catch (e) {
    console.error(e);
    return [];
  }
}
export async function deleteBook(id) {
  try {
    await axios.delete(`${API_ROUTES.BOOKS}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function rateBook(id, userId, rating) {
  const data = {
    userId,
    rating: parseInt(rating, 10),
  };

  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}/${id}/rating`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (e) {
    console.error(e);
    return e.message;
  }
}

export async function addBook(formData) {
  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        // Ne PAS fixer Content-Type, Axios gère ça
      },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.data?.message) {
      console.error('Erreur serveur:', err.response.data.message);
    } else {
      console.error('Erreur inconnue:', err);
    }
    return { error: true, message: err.message };
  }
}

export async function updateBook(data, id) {
  console.log('data reçu dans updateBook (FormData) :', data);

  // Extraire la chaîne JSON depuis la clé 'thing' de FormData
  const bookDataJSON = data.get('thing');

  // Parser en objet JavaScript
  const parsedData = bookDataJSON ? JSON.parse(bookDataJSON) : {};

  const userId = localStorage.getItem('userId');

  const book = {
    userId,
    title: parsedData.title,
    author: parsedData.author,
    year: parsedData.year,
    genre: parsedData.genre,
  };

  console.log('Objet book construit :', book);

  let newData = new FormData();
  newData.append('book', JSON.stringify(book));

  if (data.get('image')) {
    newData.append('image', data.get('image'));
  }

  try {
    const newBook = await axios({
      method: 'put',
      url: `${API_ROUTES.BOOKS}/${id}`,
      data: newData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        // Ne pas définir Content-Type, axios s’en occupe automatiquement pour FormData
      },
    });
    return newBook;
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
}