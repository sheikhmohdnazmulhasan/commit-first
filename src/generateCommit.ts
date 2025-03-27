import axios from "axios";
import * as vscode from "vscode";
import simpleGit from "simple-git";

const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateCommitMessage() {
  const git = simpleGit();
  let diff: string;

  try {
    diff = await git.diff();
    if (!diff.trim()) {
      vscode.window.showWarningMessage("No unstaged changes detected in Git.");
      return;
    }
  } catch (error) {
    vscode.window.showErrorMessage("Error getting Git diff: " + error);
    return;
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a bot that writes Git commit messages following the Conventional Commit format.",
          },
          {
            role: "user",
            content: `Generate a Conventional Commit message for this Git diff:\n\n${diff}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const commitMessage = response.data.choices[0].message.content.trim();

    // Show commit message in VS Code
    const action = await vscode.window.showInformationMessage(
      `Generated Commit: "${commitMessage}"`,
      "Use it",
      "Cancel"
    );

    if (action === "Use it") {
      await git.commit(commitMessage);
      vscode.window.showInformationMessage("Commit message applied!");
    }
  } catch (error) {
    vscode.window.showErrorMessage("Error generating commit message: " + error);
  }
}
