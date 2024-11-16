import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// For Android and iOS
const db = SQLite.openDatabase('auth.db');

// Initialize database
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT);',
          [],
          () => {
            console.log('Database and table created successfully');
            resolve();
          },
          (_, error) => {
            console.error('Error creating table:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Transaction error:', error);
      reject(error);
    }
  });
};

export const registerUser = (username, password) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, password],
          (_, result) => {
            console.log('User registered successfully');
            resolve(result);
          },
          (_, error) => {
            console.error('Error registering user:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Transaction error:', error);
      reject(error);
    }
  });
};

export const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password],
          (_, { rows: { _array } }) => {
            console.log('Login query successful');
            resolve(_array.length > 0);
          },
          (_, error) => {
            console.error('Error logging in:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Transaction error:', error);
      reject(error);
    }
  });
};