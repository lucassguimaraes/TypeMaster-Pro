
import { Lesson, Theme, KeyboardLayout } from './types';

export const THEMES: { id: Theme; name: string; class: string }[] = [
  { id: 'default', name: 'Deep Sea', class: '' },
  { id: 'cyberpunk', name: 'Cyberpunk', class: 'theme-cyberpunk' },
  { id: 'nord', name: 'Nordic', class: 'theme-nord' },
  { id: 'minimal', name: 'Minimalist', class: 'theme-minimal' },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Linha Inicial (Home Row)',
    description: 'A base da digitação. Mantenha seus dedos em ASDF e JKLÇ.',
    content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl;',
    category: 'basico'
  },
  {
    id: '2',
    title: 'Linha Inicial Expandida',
    description: 'Praticando as teclas G e H.',
    content: 'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;',
    category: 'basico'
  },
  {
    id: '3',
    title: 'Palavras Simples',
    description: 'Combinando as teclas da linha inicial.',
    content: 'fala sala jaca lada kada gaga fada dadas salas falas galas',
    category: 'basico'
  },
  {
    id: '4',
    title: 'Linha Superior',
    description: 'Praticando QWERTY UIOP.',
    content: 'qwerty uiop qwerty uiop qwerty uiop qwerty uiop',
    category: 'intermediario'
  },
  {
    id: '5',
    title: 'Frases do Dia a Dia',
    description: 'Prática de frases comuns em português.',
    content: 'o rato roeu a roupa do rei de roma. o sol brilha no ceu azul.',
    category: 'intermediario'
  }
];

export const LAYOUTS: Record<KeyboardLayout, string[][]> = {
  abnt2: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '´', '[', 'Enter'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~', ']'],
    ['Shift', '\\', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', ';', 'Shift'],
    ['Space']
  ],
  us: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Space']
  ]
};
