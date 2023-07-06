# Contributing

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Before making any pull request, please first discuss the change you mish to make via issue with at least one of the maintainers
2. Keep your pull request as small as possible and focused on one `feature`, `fix`, etc
3. Fork the project to your own repository
4. Clone your own version of `ngx-sub-form`
5. Branch off master and prefix the branch name with either `fix`, `feat`, `chore`, `docs`, `style`, `refactor` or `test`: `git checkout master && git pull && git checkout -b feat/your-feature-name` for e.g.
6. Make your changes
7. Edit, remove or add relevant tests (either unit/integration or E2E with cypress)
8. Run the tests locally by running `yarn run lib:test:watch` and `yarn run demo:test:e2e:watch`
9. Run linting by running `yarn run lint`
10. Update the `README.md` accordingly to your changes if needed
11. Run `Prettier` on the project: `yarn run prettier:write`
12. Once you're done and ready to make a commit, please follow those conventions: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit and don't forget to close the related issue either in your commit or the pull request header by writting `This closes cloudnc/ngx-sub-form#X` where `X` is the issue number
13. Push your branch to your own repository
14. Raise a pull request on `ngx-sub-form`
15. If any change is asked on the pull request, try to keep a clean history as much as possible by either using `git rebase` or `git commit --amend` (talk to us on your pull request if you're unsure)

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
