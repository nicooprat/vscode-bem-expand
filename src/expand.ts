'use strict';

import * as vscode from 'vscode';

import { findClass } from './find-class';
import { TreeParser } from './tree-parser';

let findClosestOverride: boolean | undefined;

export function overrideFindClosest(value: boolean) {
  findClosestOverride = value;
}

function findFirstClassName(currentLineNumber: number, editor: vscode.TextEditor): string | undefined {
  for (let i = 0; i < currentLineNumber; i += 1) {
    const line = editor.document.lineAt(i);

    const className = findClass(line.text);

    if (className !== undefined) {
      return className;
    }
  }
}

export function findClosestClassName(currentLineNumber: number, editor: vscode.TextEditor): string | undefined {
  const treeParser = new TreeParser();

  for (let i = currentLineNumber - 1; i >= 0; i -= 1) {
    const line = editor.document.lineAt(i);

    if (!treeParser.isRoot(line.text)) {
      continue;
    }

    const className = findClass(line.text);

    if (className !== undefined) {
      return className;
    }
  }
}

export function expand() {
  const editor = vscode.window.activeTextEditor;

  const langId = editor.document.languageId;

  if (langId !== 'html' && langId !== 'typescriptreact' && langId !== 'javascriptreact') {
    return;
  }

  const currentLineNumber = editor.selection.start.line;

  const range = new vscode.Range(new vscode.Position(currentLineNumber, 0), editor.selection.end);

  const text = editor.document.getText(range);

  if (!/&/.test(text)) {
    return;
  }

  let findClosest = vscode.workspace.getConfiguration('bemExpand').get('findClosestTag', false);

  // for testing
  if (findClosestOverride !== undefined) {
    findClosest = findClosestOverride;
  }

  const className = findClosest ? (
    findClosestClassName(currentLineNumber, editor)
  ) : (
    findFirstClassName(currentLineNumber, editor)
  );

  if (className === undefined) {
    return;
  }

  const newText = text.replace(/&/g, className);

  editor.edit((editBuilder) => {
    editBuilder.replace(range, newText);
  });

  const newPosition = new vscode.Position(currentLineNumber, newText.length);

  editor.selection = new vscode.Selection(newPosition, newPosition);
}
