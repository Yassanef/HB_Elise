# Repository Permissions and Security

## Understanding Public Repositories on GitHub

### Can People Change Your Public Repository?

**Short Answer: NO** - People cannot directly change your public repository without your permission.

### What "Public" Means

When your repository is **public**, it means:

✅ **People CAN:**
- View your code
- Clone your repository
- Fork your repository (create their own copy)
- Download your code
- See all commits, issues, and pull requests
- Submit pull requests (suggestions for changes)
- Open issues

❌ **People CANNOT:**
- Push changes directly to your repository
- Modify your code without your approval
- Delete your repository
- Change repository settings
- Merge pull requests without permission

### How Repository Permissions Work

GitHub has different permission levels:

1. **Owner** (You): Full control over the repository
2. **Admin**: Can manage repository settings and collaborators
3. **Write/Maintain**: Can push to the repository
4. **Read**: Can only view and clone (what the public has)

**By default, the public has READ-ONLY access to your repository.**

### How Changes Can Happen

The only ways your repository can be changed are:

1. **You make changes yourself** (as the owner)
2. **You add collaborators** with write access
3. **You merge pull requests** from others (requires your explicit approval)
4. **GitHub Actions or bots** that you've authorized

### Protecting Your Repository

Even though your repository is already protected, here are best practices:

#### 1. Branch Protection Rules

Protect your main branch:
- Go to Settings → Branches → Add rule
- Enable "Require pull request reviews before merging"
- Enable "Require status checks to pass before merging"

#### 2. Don't Share Credentials

- Never commit passwords, API keys, or tokens
- Use environment variables for sensitive data
- Add `.env` files to `.gitignore`

#### 3. Review Pull Requests Carefully

When someone submits a pull request:
- Review all changes before merging
- Check for malicious code
- Test the changes locally
- Only merge if you trust the changes

#### 4. Managing Collaborators

- Only add collaborators you trust
- Review the list regularly: Settings → Manage access
- Remove access when no longer needed

#### 5. Enable Security Features

- Enable Dependabot alerts
- Enable secret scanning
- Enable code scanning (if available)

### What to Do if You Want Contributions

If you want others to contribute to your project:

1. **Keep the repository public** (current state)
2. **Don't add them as collaborators** (unless you really trust them)
3. **Accept contributions via Pull Requests**:
   - They fork your repository
   - They make changes in their fork
   - They submit a pull request
   - **You review and approve/reject**
   - You merge only if acceptable

### Common Scenarios

**Q: Someone forked my repository and changed it. Is my repository affected?**
- A: No. Their fork is independent. Your repository remains unchanged.

**Q: Can someone submit a pull request with malicious code?**
- A: They can submit it, but it won't affect your repository until YOU review and merge it.

**Q: I received a pull request. Am I obligated to merge it?**
- A: No. You have complete control over what gets merged.

**Q: How do I make my repository private?**
- A: Go to Settings → Danger Zone → Change repository visibility

## Summary

Your public repository is **safe and protected**. Being public means people can see and copy your code, but they cannot change YOUR repository without your explicit permission. You maintain complete control over what changes are accepted into your codebase.

All changes must go through pull requests, which require your review and approval before being merged. This gives you full control over the content of your repository.
