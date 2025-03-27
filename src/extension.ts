import * as vscode from "vscode";
import { generateCommitMessage } from "./generateCommit";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.generateCommitMessage",
    generateCommitMessage
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
