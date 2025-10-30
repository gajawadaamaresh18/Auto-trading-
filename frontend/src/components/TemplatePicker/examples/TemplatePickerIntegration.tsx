/**
 * Template Picker Integration Example
 * 
 * Example of how to integrate the template picker into your app.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import { TemplatePicker, TemplateFormula } from './components/TemplatePicker';

// Main App Component with Template Picker
const AppWithTemplatePicker: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFormula | null>(null);

  // Handle template selection for paper mode
  const handleTryPaperMode = (template: TemplateFormula) => {
    setSelectedTemplate(template);
    setShowTemplatePicker(false);
    
    // Navigate to paper trading screen with template
    console.log('Starting paper mode with template:', template.name);
    
    // Show confirmation
    Alert.alert(
      'Paper Mode Started',
      `You're now running "${template.name}" in paper mode. You can monitor performance without real money.`,
      [
        { text: 'OK', onPress: () => {
          // Navigate to paper trading screen
          // navigation.navigate('PaperTrading', { template });
        }}
      ]
    );
  };

  // Handle template selection for editing
  const handleEditInStudio = (template: TemplateFormula) => {
    setSelectedTemplate(template);
    setShowTemplatePicker(false);
    
    // Navigate to FormulaStudio with template
    console.log('Opening FormulaStudio with template:', template.name);
    
    // Show confirmation
    Alert.alert(
      'FormulaStudio Opened',
      `You're now editing "${template.name}" in FormulaStudio. You can customize the strategy before running it.`,
      [
        { text: 'OK', onPress: () => {
          // Navigate to FormulaStudio
          // navigation.navigate('FormulaStudio', { template });
        }}
      ]
    );
  };

  // Handle template details view
  const handleViewDetails = (template: TemplateFormula) => {
    console.log('Viewing details for template:', template.name);
    
    // Show detailed information
    Alert.alert(
      template.name,
      `${template.description}\n\nUse Case: ${template.useCase}\n\nWin Rate: ${template.sampleStats.winRate}%\nProfit Factor: ${template.sampleStats.profitFactor}\nMax Drawdown: ${template.sampleStats.maxDrawdown}%`,
      [
        { text: 'Try Paper Mode', onPress: () => handleTryPaperMode(template) },
        { text: 'Edit in Studio', onPress: () => handleEditInStudio(template) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Your main app content */}
      <MainAppContent />
      
      {/* Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={handleTryPaperMode}
        onEditInStudio={handleEditInStudio}
        onViewDetails={handleViewDetails}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

// Main App Content
const MainAppContent: React.FC = () => {
  return (
    <View style={styles.content}>
      {/* Your app screens and components */}
      <MarketplaceScreen />
      <FormulaStudioScreen />
      <PaperTradingScreen />
    </View>
  );
};

// Example Screen Components
const MarketplaceScreen: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  return (
    <View style={styles.screen}>
      {/* Marketplace content */}
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplatePicker(true)}
      >
        <Ionicons name="library" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.templateButtonText}>Browse Templates</Text>
      </TouchableOpacity>
      
      {/* Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={(template) => {
          console.log('Paper mode with:', template.name);
          setShowTemplatePicker(false);
        }}
        onEditInStudio={(template) => {
          console.log('Edit in studio:', template.name);
          setShowTemplatePicker(false);
        }}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

const FormulaStudioScreen: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  return (
    <View style={styles.screen}>
      {/* FormulaStudio content */}
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplatePicker(true)}
      >
        <Ionicons name="create" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.templateButtonText}>Start from Template</Text>
      </TouchableOpacity>
      
      {/* Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={(template) => {
          console.log('Paper mode with:', template.name);
          setShowTemplatePicker(false);
        }}
        onEditInStudio={(template) => {
          console.log('Edit in studio:', template.name);
          setShowTemplatePicker(false);
        }}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

const PaperTradingScreen: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  return (
    <View style={styles.screen}>
      {/* Paper trading content */}
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplatePicker(true)}
      >
        <Ionicons name="play-circle" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.templateButtonText}>Try New Strategy</Text>
      </TouchableOpacity>
      
      {/* Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={(template) => {
          console.log('Paper mode with:', template.name);
          setShowTemplatePicker(false);
        }}
        onEditInStudio={(template) => {
          console.log('Edit in studio:', template.name);
          setShowTemplatePicker(false);
        }}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

// Template Picker with Custom Actions
const CustomTemplatePicker: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const handleCustomAction = (template: TemplateFormula, action: string) => {
    switch (action) {
      case 'try_paper_mode':
        console.log('Starting paper mode with:', template.name);
        break;
      case 'edit_in_studio':
        console.log('Opening FormulaStudio with:', template.name);
        break;
      case 'view_details':
        console.log('Viewing details for:', template.name);
        break;
      case 'clone_template':
        console.log('Cloning template:', template.name);
        break;
      default:
        console.log('Unknown action:', action);
    }
    setShowTemplatePicker(false);
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplatePicker(true)}
      >
        <Ionicons name="library" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.templateButtonText}>Browse Templates</Text>
      </TouchableOpacity>
      
      {/* Custom Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={(template) => handleCustomAction(template, 'try_paper_mode')}
        onEditInStudio={(template) => handleCustomAction(template, 'edit_in_studio')}
        onViewDetails={(template) => handleCustomAction(template, 'view_details')}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

// Template Picker with Filters
const FilteredTemplatePicker: React.FC = () => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('momentum');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');

  return (
    <View style={styles.screen}>
      {/* Filter controls */}
      <View style={styles.filterControls}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === 'momentum' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedCategory('momentum')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedCategory === 'momentum' && styles.filterButtonTextActive
          ]}>
            Momentum
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedDifficulty === 'beginner' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedDifficulty('beginner')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedDifficulty === 'beginner' && styles.filterButtonTextActive
          ]}>
            Beginner
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplatePicker(true)}
      >
        <Ionicons name="library" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.templateButtonText}>Browse Templates</Text>
      </TouchableOpacity>
      
      {/* Template Picker */}
      <TemplatePicker
        visible={showTemplatePicker}
        onTryPaperMode={(template) => {
          console.log('Paper mode with:', template.name);
          setShowTemplatePicker(false);
        }}
        onEditInStudio={(template) => {
          console.log('Edit in studio:', template.name);
          setShowTemplatePicker(false);
        }}
        onClose={() => setShowTemplatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  
  // Template button styles
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  templateButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
  },
  
  // Filter controls styles
  filterControls: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default AppWithTemplatePicker;
