# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Specifies the nixpkgs channel to use for fetching packages.
  # "stable-24.11" is the recommended channel for stability.
  # "unstable" can be used for the latest packages.
  channel = "stable-24.11"; # or "unstable"

  # A list of packages to install in the development environment.
  # You can find more packages at https://search.nixos.org/packages.
  packages = [
    pkgs.nodejs_20 # Node.js version 20
    pkgs.zulu      # A certified build of OpenJDK
    # Added Python and SQLite for the agentic AI framework
    pkgs.python3
    pkgs.python3Packages.pip
    pkgs.sqlite
    pkgs.python3Packages.pyyaml # Added PyYAML for the FSM runner
  ];

  # A map of environment variables to set in the workspace.
  env = {};

  # Configures the Firebase emulators.
  services.firebase.emulators = {
    # If true, automatically starts the emulators when a firebase.json file is detected.
    # Currently disabled because the project is using production backends.
    detect = false;

    # The Firebase project ID to use for the emulators.
    projectId = "demo-app";

    # A list of Firebase services to emulate.
    services = ["auth" "firestore"];
  };

  # Configures the IDX (IDE) workspace.
  idx = {
    # A list of VS Code extensions to install.
    # You can find extensions on https://open-vsx.org/ and use the "publisher.id" format.
    extensions = [
      # "vscodevim.vim" # Example: uncomment to install the Vim extension.
    ];

    # Workspace-specific settings.
    workspace = {
      # Actions to perform when the workspace is created.
      onCreate = {
        # A list of files to open automatically when the workspace starts.
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };

    # Configures the preview feature in the IDE.
    previews = {
      # Enables or disables the preview feature.
      enable = true;

      # A map of preview configurations.
      previews = {
        # Configuration for the "web" preview.
        web = {
          # The command to run to start the development server.
          # It uses the PORT environment variable provided by the IDE.
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];

          # The manager to use for the preview. "web" is for web applications.
          manager = "web";
        };
      };
    };
  };
}
