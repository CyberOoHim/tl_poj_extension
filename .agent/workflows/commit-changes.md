---
description: Generate a commit message from staged changes, satisfy user review, and push to GitHub.
---

1. Stage all changes to ensure new files are included in the diff.
   `git add .`

// turbo
2. Show the changes that are staged for commit.
   `git diff --cached`

1. **(AI Task)**:
   - Analyze the output of `git diff --cached`.
   - Generate a concise and descriptive commit message following the **Conventional Commits** format:
     - `feat: ...` for new features
     - `fix: ...` for bug fixes
     - `docs: ...` for documentation changes
     - `style: ...` for formatting/style changes
     - `refactor: ...` for code restructuring
     - `chore: ...` for maintenance/config tasks
   - **User Confirmation**: The next step (running the commit command) will automatically ask the user for confirmation. Ensure the commit message is clearly visible in the `CommandLine` argument.

2. Commit the changes with the generated message.
   `git commit -m "YOUR_GENERATED_MESSAGE_HERE"`

3. Push the changes to the remote repository.
   `git push`
