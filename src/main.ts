import { initialGameState } from './game/initialState';
import { renderApp } from './ui/render';
import './styles.css';

const root = document.querySelector<HTMLElement>('#app');

if (root === null) {
  throw new Error('#app root element not found');
}

renderApp(root, initialGameState);
