
import './styles/quasar.sass';
import '@quasar/extras/material-icons/material-icons.css';
import { Dialog, Notify, Loading } from "quasar";
// To be used on app.use(Quasar, { ... })
export default {
  config: {},
  plugins: {
    Dialog,
    Notify,
    Loading
  },
};