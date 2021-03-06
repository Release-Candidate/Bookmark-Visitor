# Contributing

Any help is welcome!

If you encounter a problem using one of Bookmark-Visitor's browser extensions, a task it not as easy as you'd like it to be or you'd like something added to it: open an issue at GitHub, see section [Report Issues](#report-issues-bugs-and-feature-requests).

- [Contributing](#contributing)
  - [Report Issues (Bugs and Feature Requests)](#report-issues-bugs-and-feature-requests)
  - [Forking the Repository](#forking-the-repository)
    - [Github Documentation on Collaborating with Issues and Pull Requests](#github-documentation-on-collaborating-with-issues-and-pull-requests)
  - [Developing Bookmark-Visitor](#developing-bookmark-visitor)
    - [Changing and Generating Documentation](#changing-and-generating-documentation)
      - [Installing Dependencies](#installing-dependencies)
      - [MkDocs Files](#mkdocs-files)
      - [Read the Docs Configuration](#read-the-docs-configuration)
      - [GitHub Documentation](#github-documentation)
    - [Source Code](#source-code)
      - [NPM and Gulp](#npm-and-gulp)
      - [Pipenv and MkDocs](#pipenv-and-mkdocs)
  - [GitHub Workflows](#github-workflows)
  - [GitHub Issue Templates](#github-issue-templates)
  - [What is What? - List of all Files](#what-is-what---list-of-all-files)
    - [GitHub Workflows & Issue Templates](#github-workflows--issue-templates)
    - [MkDocs documentation](#mkdocs-documentation)
    - [Translations](#translations)
    - [Javascript sources, HTML and CSS](#javascript-sources-html-and-css)

## Report Issues (Bugs and Feature Requests)

Please help making Bookmark-Visitor better by filing bug reports and feature requests.

File a bug report at [GitHub bur report](https://github.com/Release-Candidate/Bookmark-Visitor/issues/new?assignees=&labels=&template=bug_report.md&title=)).
Add a feature request at [GitHub feature request](https://github.com/Release-Candidate/Bookmark-Visitor/issues/new?assignees=&labels=&template=feature_request.md&title=).
Take a look at the [Issue Tracker at GitHub](https://github.com/Release-Candidate/Bookmark-Visitor/issues)

## Forking the Repository

If you'd like to contribute directly, e.g. better the documentation, add another language or write some source code: fork Bookmark-Visitor by clicking the `Fork` button in the upper right corner of the GitHub project website. Check out your fork of Bookmark-Visitor using the URL from the `Code` button of your fork on Github. The URL should be something like github.com/YOUR_USERNAME/Bookmark-Visitor.git.

Details about how to fork a repository on Github are [here](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo).

Make your changes, push them to your forked repository and make a pull-request (e.g. using the Pull request-button above and right of GitHubs source file view).

See [GitHub on Pull-Requests](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/proposing-changes-to-your-work-with-pull-requests) and another [How-To](https://github.com/MarcDiethelm/contributing/blob/master/README.md).

### Github Documentation on Collaborating with Issues and Pull Requests

See GitHub's documentation about how to contribute for details: [Collaborating with issues and pull requests](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests).

## Developing Bookmark-Visitor

### Changing and Generating Documentation

#### Installing Dependencies

To generate the documentation using MkDocs, a virtual Python environment is needed. First you need to install Python, if you don't have it installed already - either from your distributions repository, using the XCode or [Homebrew](https://brew.sh/) version, or getting it from [Python.org](https://www.python.org/downloads/).

See

- [Using Python on Windows](https://docs.python.org/3/using/windows.html)
- [Using Python on a Macintosh](https://docs.python.org/3/using/mac.html)
- [Using Python on Unix Platforms](https://docs.python.org/3/using/unix.html)

In the file [`Pipfile`](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/Pipfile) there is a stanza saying

```ini
[requires]
python_version = "3.9"
```

That's just because I used 3.9 when generating that documentation, and Pipenv is picky about the version mentioned there. Just edit that to match your installed Python version.

Install `pipenv` using the package manager pip

```shell
pip install pipenv
```

Now you're ready to download and install the needed packages using pipenv

```shell
pipenv install --dev
```

After that you can use MkDocs.

Call

```shell
pipenv run mkdocs serve
```

in the root directory of Bookmark-Visitor and connect to the running webserver at [http://127.0.0.1:8000](http://127.0.0.1:8000).
This preview shows changes in realtime, so any changes to the markdown files in `docs` you see as preview as soon as you save the file. The generated HTML files are saved in the directory `sites`.

#### MkDocs Files

- `mkdocs.yml` - the MkDocs configuration, specially the configuration of the navigation sidebar in `nav` which you may need to edit

```yml
  nav:
  - Home: index.md
  - Project Links:
      - "Downloads": https://github.com/Release-Candidate/Bookmark-Visitor/releases/latest
      - "GitHub Project Page": "https://github.com/Release-Candidate/Bookmark-Visitor"
      - "Report a Bug or a Feature Request": "https://github.com/Release-Candidate/Bookmark-Visitor/issues/new/choose"
      - "Issue Tracker at GitHub": "https://github.com/Release-Candidate/Bookmark-Visitor/issues"
  - "Installation & Usage":
      - "Installation & Usage": usage.md
      - "License": license.md
  - Contributing:
      - Contributing: contributing.md
```

- `docs/` - the markdown files that are used to generate the
   HTML sites in the directory `sites/`

#### Read the Docs Configuration

- `.readthedocs.yaml` the configuration for Read the Docs
- `docs/requirements.txt` the packages needed by MkDocs
   when generating the documentation at Read the Docs.
   Locally needed packages are configured in `Pipfile`

Read the Docs automatically generates the MkDocs documentation after each `git push`.

#### GitHub Documentation

The Markdown documentation for GitHub are the files [README.md](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/README.md) and [CHANGELOG.md](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/CHANGELOG.md) in the project root directory.

### Source Code

Before you can use the configured Tools of this project, you have to download and install the needed tools.

#### NPM and Gulp

Bookmark-Visitor uses NPM and Gulp to build the packages.

To install NPM, download and install Node.js for your OS: [Node.js Website](https://nodejs.org/)

To install all needed tools, run (`npm install --dev` should not be needed, `npm install` should do the same).

```shell
npm install
npm install --dev
```

Now you can use the following NPM scripts:

- `npm run lint` - To run ESLint on all Javascript files in the project
- `npm run list` - To see the list of all Gulp tasks
- `npm run pack` - To copy the images and translations to the browser folders and pack them with the sources.
- `npm run clean` - To delete all copied directories and zip files generated by `npm run pack`

#### Pipenv and MkDocs

To generate the documentation using MkDocs (see [Changing and Generating Documentation](#changing-and-generating-documentation)), a virtual Python environment is needed. So, first you need to install Python, if you don't have it installed already - either from your distributions repository, using the XCode or [Homebrew](https://brew.sh/) version, or getting it from [Python.org](https://www.python.org/downloads/).

In the file [`Pipfile`](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/Pipfile) there is a stanza saying

```ini
[requires]
python_version = "3.9"
```

  That's just because I used 3.9 when generating that
documentation, and Pipenv is picky about the version mentioned
there. Just edit that to match your installed
Python version.
Install `pipenv` using the package
manager pip

```shell
pip install pipenv
```

Now you're ready to download and install the needed packages using pipenv

```shell
pipenv install --dev
```

After that you should be able to use the executable `mkdocs` in the local virtual Python environment in your project root using `pipenv run`:

```shell
pipenv run mkdocs --version
```

## GitHub Workflows

All tests and builds are executed on Linux.

These are the GitHub workflows defined in the directory `.github/workflows`

- `create_packages.yml` zips the sources for the browser extensions and
  generates a new GitHUb release with these files appended. Runs automatically after tagging
  the source with a release tag of the form `v?.?.?`. Appends the newest entry in [CHANGELOG.md](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/CHANGELOG.md) to the release - script [`scripts/get_changelog.sh`][(https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/scripts/get_changelog.sh](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/scripts/get_changelog.sh))
  See the [latest release on GitHub](https://github.com/Release-Candidate/Bookmark-Visitor/releases/tag/v0.9.3) as an example
- `eslint.yml` runs `eslint`, the javascript linter using the configuration in [.eslintrc.json](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/.eslintrc.json) on all javascript source files.

## GitHub Issue Templates

Issue templates for GitHub in `.github/ISSUE_TEMPLATE/`

- `bug_report.md` Bug report template
- `feature_request.md` Feature request template

## What is What? - List of all Files

A list of all files in this repository and what they do or configure.

- `./README.md` - The main documentation file.
- `./LICENSE` - The project'S license, GPLv3.
- `./CHANGELOG.md` - The project's changelog.
- `./.prettierrc.json` - Configuration file for Prettier, a source code formatter.
- `./package.json`, `package-lock.json` - List of NPM packages (and Gulp plugins) needed by Bookmark-Visitor
- `./gulpfile.js` - Gulp configuration script
- `/.eslintrc.json` - ESLint configuration
- `./bookmark-visitor.code-workspace` - The Visual Studio Code workspace file.
- `./.vscode/` - Directory containing additional Visual Studio Code configuration.

### GitHub Workflows & Issue Templates

Directory `./github/ISSUE_TEMPLATE/`:

- `./.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template for GitHub
- `./.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template for GitHub

Directory `./.github/workflows/`:

- `create_packages.yml` zips the sources for the browser extensions and
  generates a new GitHUb release with these files appended. Runs automatically after tagging
  the source with a release tag of the form `v?.?.?`. Appends the newest entry in [CHANGELOG.md](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/CHANGELOG.md) to the release - script [`scripts/get_changelog.sh`][(https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/scripts/get_changelog.sh](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/scripts/get_changelog.sh))
  See the [latest release on GitHub](https://github.com/Release-Candidate/Bookmark-Visitor/releases/tag/v0.9.3) as an example
- `eslint.yml` runs `eslint`, the javascript linter using the configuration in [.eslintrc.json](https://github.com/Release-Candidate/Bookmark-Visitor/blob/main/.eslintrc.json) on all javascript source files.

### MkDocs documentation

- `./Pipfile` - Packages nedded by MkDocs to install using `pipenv` and the package `mkdocs` itself.
- `./mkdocs.yml` - The configuration file for MkDocs, contains the website's index:

```YML
nav:
  - Home: index.md
  - Project Links:
      - "Downloads": https://github.com/Release-Candidate/Bookmark-Visitor/releases/latest
      - "GitHub Project Page": "https://github.com/Release-Candidate/Bookmark-Visitor"
      - "Report a Bug or a Feature Request": "https://github.com/Release-Candidate/Bookmark-Visitor/issues/new/choose"
      - "Issue Tracker at GitHub": "https://github.com/Release-Candidate/Bookmark-Visitor/issues"
  - "Installation & Usage":
      - "Installation & Usage": usage.md
      - "License": license.md
  - Contributing:
      - Contributing: contributing.md
```

- `https://readthedocs.org/`, to host the generated documentation.

Directory `./docs`:

- `docs/requirements.txt` - Packages (plugins for MkDocs) that have to be installed by Read the Docs to generate the documentation.
- `./docs/index.md` - The documentation's home page.
- `./docs/usage.md` - Usage information.
- `./docs/contributing.md` - Information on how to contribute to the project.
- `./docs/license.md` - The license of the Bookmark-Visitor, GPLv3

Directory `./run_haddock.bat`. Sadly I haven't found a way to generate that documentation using `mkdocs build`, which is what Read the Docs calls to build it. So for now it is included in the source repository (but not the Stack template file).

### Translations

Each language has its own file containing the translated texts in a subdirectory of the directory `_locales/` named after the language.

Examples:

- German translation: `./_locales/de/messages.json`
- English translation: `./_locales/en/messages.json`

A translation file in JSON format looks like this:

```json
{
  "extensionName": {
    "message": "Bookmark-Visitor",
    "description": "Name of the extension."
  },
  "extensionDescription": {
    "message": "Saves a link to the current active tab with its title, keywords and a long and short description as markdown, Org-Mode or plain text",
    "description": "Description of the extension."
  },
  "browserExtension": {
    "message": "browser extension",
    "description": "Translation of 'browser extension'"
  },
  "previewDescription": {
    "message": "This is a short description of the content of the website, usually set by the website itself, but you can change that.",
    "description": "Short description for the preview in the 'options' page"
  },
  ...
}
```

### Javascript sources, HTML and CSS

- `manifest.json` - The extension's configuration, one for each supported browser
- `formatContent.js` - Functions and constants needed by the other source files
- `background.js` - The source of the background script, that saves the title, url, short description and keywords of the current tab
- `options.js` - The option page of the extension, Javascript source
- `options.html` - The option page of the extension, HTML
- `options.css` - The option page of the extension, CSS
- `popup.js` - The popup of the extension, Javascript source - main source file
- `popup.html` - The popup of the extension, HTML
- `popup.css` - The popup of the extension, CSS
