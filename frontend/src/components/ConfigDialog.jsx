import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  IconButton, 
  Typography, 
  Link, 
  Box 
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Lista de chaves configurada com Labels, Dicas (tips) e Links diretos para facilitar o UX
const ENV_KEYS = [
  { 
    key: 'JIRA_USER', 
    label: 'Jira User',
    tip: 'O e-mail institucional ou de login utilizado na sua conta do Jira (ex: seu-nome@empresa.com).'
  },
  { 
    key: 'JIRA_TOKEN', 
    label: 'Jira Token',
    tip: 'Token de segurança pessoal gerado diretamente nas configurações da sua conta Atlassian.',
    link: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    linkLabel: 'Gerar Token de API na Atlassian'
  },
  { 
    key: 'JIRA_BASE_URL', 
    label: 'Jira Base URL',
    tip: 'A URL inicial do seu painel do Jira. Deve incluir o "https://" e não deve conter a barra "/" no final (ex: https://sua-empresa.atlassian.net).'
  },
  { 
    key: 'ZEPHYR_TOKEN', 
    label: 'Zephyr Token',
    tip: 'O token de acesso JWT do Zephyr Scale. Clique na sua foto de perfil do Jira > Zephyr Scale API Access Tokens',
    link: 'https://support.smartbear.com/zephyr-scale-cloud/docs/en/rest-api/generating-api-access-tokens.html',
    linkLabel: 'Gerar o Token do Zephyr Scale'
  },
  { 
    key: 'ZEPHYR_PROJECT_KEY', 
    label: 'Zephyr Project Key',
    tip: 'A sigla/chave identificadora do seu projeto no Jira. Por exemplo: se a sua task é "BB-4807", a sua Project Key é apenas "BB".'
  },
  { 
    key: 'GEMINI_API_KEY', 
    label: 'Gemini API Key',
    tip: 'Chave de acesso criada gratuitamente no console do Google para dar vida à IA responsável por ler a história e criar os cenários.',
    link: 'https://aistudio.google.com/app/apikey',
    linkLabel: 'Obter API Key no Google AI Studio'
  },
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
      
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 'bold' }}>
          Configurações de Credenciais & Tokens
        </DialogTitle>
        
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {ENV_KEYS.map(({ key, label, tip, link, linkLabel }) => (
            <Box key={key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <TextField
                name={key}
                label={label}
                value={values[key]}
                onChange={handleChange}
                fullWidth
                size="small"
                type={key.toLowerCase().includes('token') || key.toLowerCase().includes('key') ? 'password' : 'text'}
                autoComplete="off"
              />
              
              {/* Seção de Texto Auxiliar (Tip) e Links Dinâmicos */}
              <Box sx={{ px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary" style={{ lineHeight: 1.3 }}>
                  {tip}
                </Typography>
                
                {link && (
                  <Link 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    variant="caption"
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 0.5, 
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'underline',
                      width: 'fit-content',
                      mt: 0.25
                    }}
                  >
                    {linkLabel}
                    <OpenInNewIcon sx={{ fontSize: 11 }} />
                  </Link>
                )}
              </Box>
            </Box>
          ))}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Salvar Configurações
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}