import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

import * as vscode from 'vscode';

import { findClass } from '../src/find-class';
import { TreeParser } from '../src/tree-parser';
import { overrideFindClosest } from '../src/expand';
import * as bemExpand from '../src/extension';

suite('Extension Tests', () => {
  test('findClass', () => {
    assert.equal(findClass(`  <div class="l-foo l-foo--special">`), 'l-foo');
  });

  test('TreeParser previous line', () => {
    const treeParser = new TreeParser();

    assert.equal(treeParser.isRoot(`  <div class="l-foo l-foo--special">`), true);
  });

  test('TreeParser ignore self closing', () => {
    const treeParser = new TreeParser();

    assert.equal(treeParser.isRoot(`    <img src="foo.jpg" />`), false);
    assert.equal(treeParser.isRoot(`  <div class="l-foo l-foo--special">`), true);
  });

  test('TreeParser ignore open close', () => {
    const treeParser = new TreeParser();

    assert.equal(treeParser.isRoot(`  <div class="l-button">Text</div>`), false);
    assert.equal(treeParser.isRoot(`  <div class="l-foo l-foo--special">`), true);
  });

  test('TreeParser complex', () => {
    const treeParser = new TreeParser();

    assert.equal(treeParser.isRoot(`    </div>`), false);
    assert.equal(treeParser.isRoot(`      </button>`), false);
    assert.equal(treeParser.isRoot(`        Button`), false);
    assert.equal(treeParser.isRoot(`      <button class="l-button">`), false);
    assert.equal(treeParser.isRoot(`    <div class="l-container">`), false);
    assert.equal(treeParser.isRoot(`  <div class="l-foo l-foo--special">`), true);
  });

  test('bemExpand', () => {
    overrideFindClosest(false);

    const testFilePath = path.join(os.tmpdir(), 'bem-expand-' + (Math.random() * 100000) + '.html');

    fs.writeFileSync(testFilePath, `<div class="l-foo l-foo--special">\n  .&__bar\n</div>`);

    return vscode.workspace.openTextDocument(testFilePath).then((document) => {
      return vscode.window.showTextDocument(document).then((editor) => {
        const position = new vscode.Position(1, 9);

        editor.selection = new vscode.Selection(position, position);

        return vscode.commands.executeCommand('extension.bemExpand').then(() => {
          assert.equal(editor.document.lineAt(1).text, `  <div class="l-foo__bar"></div>`);
        });
      });
    });
  });

  test('bemExpand find closest', () => {
    overrideFindClosest(true);

    const testFilePath = path.join(os.tmpdir(), 'bem-expand-' + (Math.random() * 100000) + '.html');

    fs.writeFileSync(
      testFilePath,
      (
        `<div class="r-foo">\n` +
        `  <div class="r-foo__bar"></div>\n` +
        `  <div class="r-foo__bar">\n` +
        `    <div class="r-foo__baz">\n` +
        `      Test\n` +
        `    </div>\n` +
        `\n` +
        `    .&--bar\n` +
        `  </div>\n` +
        `</div>\n`
      ),
    );

    return vscode.workspace.openTextDocument(testFilePath).then((document) => {
      return vscode.window.showTextDocument(document).then((editor) => {
        const position = new vscode.Position(7, 11);

        editor.selection = new vscode.Selection(position, position);

        return vscode.commands.executeCommand('extension.bemExpand').then(() => {
          assert.equal(editor.document.lineAt(7).text, `    <div class="r-foo__bar--bar"></div>`);
        });
      });
    });
  });
});
