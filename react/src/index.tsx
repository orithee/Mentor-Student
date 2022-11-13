import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';

const root = createRoot(document.getElementById('root')!);
root.render(
  // <Provider store={store}>
  <App />
  // </Provider>
);
