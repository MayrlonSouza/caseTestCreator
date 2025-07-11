import TestCaseForm from './components/TestCaseForm';
import ConfigDialog from './components/ConfigDialog';
import UserStoryForm from './components/UserStoryForm';

function App() {
  return (
    <div style={{ position: 'right', minHeight: '100vh' }}>
      <ConfigDialog />
      <h1>Gerador de Histórias de Usuário</h1>
      <UserStoryForm />
      <hr style={{ margin: '40px 0' }} />
      <h1>Gerador de Cenários de Teste</h1>
      <TestCaseForm />
    </div>
  );
}

export default App;