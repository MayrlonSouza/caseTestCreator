import TestCaseForm from './components/TestCaseForm';
import ConfigDialog from './components/ConfigDialog';

function App() {
  return (
    <div style={{ position: 'right', minHeight: '100vh' }}>
      <ConfigDialog />
      <h1>Gerador de Cenários de Teste</h1>
      <TestCaseForm />
    </div>
  );
}

export default App;
