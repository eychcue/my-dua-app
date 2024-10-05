// File: components/DuaAccordion.tsx

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaItem from '@/components/DuaItem';
import { DuaCategory } from '@/types/dua';

type Props = {
  categories: DuaCategory[];
};

export default function DuaAccordion({ categories }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <View>
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          <TouchableOpacity onPress={() => toggleCategory(category.id)}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
          </TouchableOpacity>
          {expandedCategory === category.id && (
            <View style={styles.duaList}>
              {category.duas.map((dua) => (
                <DuaItem key={dua.id} dua={dua} />
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  duaList: {
    paddingLeft: 20,
  },
});
