// Installs the Etesian Quasar integration (from the design repo) after Quasar itself.
import { defineBoot } from '@quasar/app-vite';
import { EtesianQuasar } from 'etesian-design/quasar';

export default defineBoot(({ app }) => {
  // hybrid colour mode is the N9 default; the site never follows the OS dark setting
  app.use(EtesianQuasar, { syncDark: false, mode: 'hybrid' });
});
