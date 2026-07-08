import { useState } from 'react';
import { createTestCases } from '../services/api';
import { 
  Box, Button, TextField, Typography, Paper, CircularProgress, 
  Alert, Select, MenuItem, FormControl, InputLabel, Radio, 
  RadioGroup, FormControlLabel 
} from '@mui/material';

export default function TestCaseForm() {
  const [action, setAction] = useState('create'); 
  const [issueKey, setIssueKey] = useState('');
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskType, setTaskType] = useState('Backend');
  const [parentKey, setParentKey] = useState(''); 
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);
    
    try {
      const payload = action === 'create' 
        ? { action, taskTitle, taskText, taskType, parentKey } 
        : { action, issueKey };

      const data = await createTestCases(payload);
      setResult(data);
    } catch (err) {
      const respError = err.response?.data?.error;
      if (typeof respError === 'string') {
        setError(respError);
      } else if (respError && typeof respError === 'object') {
        setError(respError.message || JSON.stringify(respError));
      } else {
        setError(err.message || "Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Paper elevation={4} sx={{ p: 4, minWidth: 400, maxWidth: 650, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Selecione a opção desejada e preencha os campos abaixo:
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3, mt: 1 }}>
          <RadioGroup 
            row 
            value={action} 
            onChange={(e) => setAction(e.target.value)}
          >
            <FormControlLabel value="create" control={<Radio color="primary" />} label="Criar Nova Task e Testes" />
            <FormControlLabel value="existing" control={<Radio color="primary" />} label="Gerar Testes para Task Existente" />
          </RadioGroup>
        </FormControl>

        <form onSubmit={handleSubmit}>
          
          {action === 'create' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Título da Task"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                required
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Funcionalidade</InputLabel>
                  <Select
                    value={taskType}
                    label="Tipo de Funcionalidade"
                    onChange={e => setTaskType(e.target.value)}
                  >
                    <MenuItem value="Backend">História de Backend</MenuItem>
                    <MenuItem value="Frontend">História de Frontend</MenuItem>
                    <MenuItem value="Épico">Épico</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Task Pai (Opcional)"
                  placeholder="Ex: PROJ-10 (Épico ou Iniciativa)"
                  value={parentKey}
                  onChange={e => setParentKey(e.target.value)}
                  fullWidth
                />
              </Box>

              <TextField
                label="Rascunho / Contexto da Tarefa"
                placeholder="Descreva o que a funcionalidade faz. A IA irá formatá-la e criará no Jira..."
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                required
                multiline
                rows={6}
                fullWidth
              />
            </Box>
          )}

          {action === 'existing' && (
            <TextField
              label="Chave da Task no Jira (Ex: PROJ-123)"
              value={issueKey}
              onChange={e => setIssueKey(e.target.value)}
              required
              fullWidth
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, height: 48 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (action === 'create' ? 'Criar Task e Testes' : 'Gerar Testes')}
          </Button>
        </form>

        {/* MENSAGEM DE FEEDBACK ENQUANTO CARREGA */}
        {loading && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <strong>Processando a sua requisição...</strong><br/>
            Como estamos gerando conteúdo com IA e sincronizando com o Jira e o Zephyr, esse processo pode levar alguns minutos. Por favor, não feche a tela.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {result && !loading && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={result.partialSuccess ? "warning" : "success"} 
              sx={{ mb: 2 }}
            >
              {result.message}
            </Alert>
            
            {result.testCases && result.testCases.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Detalhes dos Casos de Teste (Zephyr):
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto', background: '#f5f5f5' }}>
                  <pre style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(result.testCases, null, 2)}
                  </pre>
                </Paper>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}