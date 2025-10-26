import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { FormulaStudio } from './components/FormulaStudio';
import { Formula } from './types';

const App: React.FC = () => {
  const handleFormulaChange = (formula: Formula) => {
    console.log('Formula changed:', formula);
  };

  const handleSave = (formula: Formula) => {
    console.log('Saving formula:', formula);
    // Here you would typically save to backend or local storage
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <FormulaStudio
        onFormulaChange={handleFormulaChange}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default App;