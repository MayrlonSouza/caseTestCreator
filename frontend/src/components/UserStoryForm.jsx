import { useState } from 'react';
import { generateAndApplyUserStory } from '../services/api';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export default function UserStoryForm() {
  const [issueKey, setIssueKey] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);
    try {
      const data = await generateAndApplyUserStory(issueKey, description);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Paper elevation={4} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>
          Gerar e Aplicar User Story Ideal
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Issue Key"
            value={issueKey}
            onChange={e => setIssueKey(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Descrição (breve necessidade ou funcionalidade)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            required
            multiline
            minRows={3}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Gerar User Story'}
          </Button>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resultado:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, background: '#f5f5f5' }}>
              <pre style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
}