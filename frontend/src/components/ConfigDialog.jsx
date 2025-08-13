import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const ENV_KEYS = [
  { key: 'JIRA_USER', label: 'Jira User' },
  { key: 'JIRA_TOKEN', label: 'Jira Token' },
  { key: 'JIRA_BASE_URL', label: 'Jira Base URL' },
  { key: 'ZEPHYR_TOKEN', label: 'Zephyr Token' },
  { key: 'ZEPHYR_PROJECT_KEY', label: 'Zephyr Project Key' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key' },
];

export default function ConfigDialog() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => {
    const saved = {};
    ENV_KEYS.forEach(({ key }) => {
      saved[key] = localStorage.getItem(key) || '';
    });
    return saved;
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    ENV_KEYS.forEach(({ key }) => {
      localStorage.setItem(key, values[key]);
    });
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <IconButton
        aria-label="Configurações"
        onClick={() => setOpen(true)}
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        <SettingsIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Configurações de Tokens</DialogTitle>
        <DialogContent>
          {ENV_KEYS.map(({ key, label }) => (
            <TextField
              key={key}
              name={key}
              label={label}
              value={values[key]}
              onChange={handleChange}
              margin="dense"
              fullWidth
              type={key.toLowerCase().includes('token') || key.toLowerCase().includes('key') ? 'password' : 'text'}
              autoComplete="off"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}