import { initialGameState } from './game/initialState';
import { renderApp } from './ui/render';
import './styles.css';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('App root element was not found.');
}

renderApp(root, initialGameState);
