import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanGestureHandler,
  State,
} from 'react-native';
import { Card, Button, TextInput, Modal, Portal } from 'react-native-paper';
import { Block } from '@/types';

interface BlockEditorProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, position: { x: number; y: number }) => void;
  isSelected?: boolean;
  onSelect?: (blockId: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  onUpdate,
  onDelete,
  onMove,
  isSelected = false,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(block.name);
  const [editParameters, setEditParameters] = useState(
    JSON.stringify(block.parameters, null, 2)
  );

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newPosition = {
        x: event.nativeEvent.absoluteX - 50,
        y: event.nativeEvent.absoluteY - 50,
      };
      onMove(block.id, newPosition);
    }
  };

  const handleSave = () => {
    try {
      const parsedParameters = JSON.parse(editParameters);
      onUpdate({
        ...block,
        name: editName,
        parameters: parsedParameters,
      });
      setIsEditing(false);
    } catch (error) {
      // Handle JSON parse error
      console.error('Invalid JSON parameters:', error);
    }
  };

  const handleDelete = () => {
    onDelete(block.id);
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'indicator': return '#2196F3';
      case 'condition': return '#FF9800';
      case 'action': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <>
      <PanGestureHandler
        onHandlerStateChange={handleGestureEvent}
        onGestureEvent={handleGestureEvent}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: getBlockColor(block.type),
              left: block.position.x,
              top: block.position.y,
              borderColor: isSelected ? '#FFD700' : 'transparent',
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
          onTouchStart={() => onSelect?.(block.id)}
        >
          <Text style={styles.title}>{block.name}</Text>
          <Text style={styles.type}>{block.type}</Text>
          <View style={styles.actions}>
            <Button
              mode="text"
              onPress={() => setIsEditing(true)}
              testID="edit-block-button"
            >
              Edit
            </Button>
            <Button
              mode="text"
              onPress={handleDelete}
              testID="delete-block-button"
            >
              Delete
            </Button>
          </View>
        </View>
      </PanGestureHandler>

      <Portal>
        <Modal
          visible={isEditing}
          onDismiss={() => setIsEditing(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Title>Edit Block</Card.Title>
            <Card.Content>
              <TextInput
                label="Block Name"
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                testID="block-name-input"
              />
              <TextInput
                label="Parameters (JSON)"
                value={editParameters}
                onChangeText={setEditParameters}
                multiline
                numberOfLines={4}
                style={styles.input}
                testID="block-parameters-input"
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setIsEditing(false)}>Cancel</Button>
              <Button onPress={handleSave} testID="save-block-button">
                Save
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    height: 80,
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  type: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  modal: {
    margin: 20,
  },
  input: {
    marginBottom: 16,
  },
});