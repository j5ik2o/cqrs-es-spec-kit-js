{
  description = "CQRS/ES Spec Kit JS - Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js LTS (v22)
            nodejs_22

            # pnpm package manager
            nodePackages.pnpm

            # Docker tools (for local development)
            docker
            docker-compose

            # AWS CLI (for deployment/testing)
            awscli2

            # Useful tools
            jq
            curl
          ];

          shellHook = ''
            echo "🚀 CQRS/ES Spec Kit JS Development Environment"
            echo ""
            echo "Available tools:"
            echo "  - Node.js: $(node --version)"
            echo "  - pnpm: $(pnpm --version)"
            echo ""
            echo "Quick start:"
            echo "  pnpm install    # Install dependencies"
            echo "  pnpm build      # Build all packages"
            echo "  pnpm test       # Run tests"
            echo ""
          '';
        };
      }
    );
}
