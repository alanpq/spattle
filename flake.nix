{
  description = "example-node-js-flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
            config.permittedInsecurePackages = [
            "nodejs-14.21.3"
            "openssl-1.1.1w"

            ];
          overlays = [ (final: prev: {
            nodejs = prev.nodejs_14;
            })];
        };

      in rec {

        # enables use of `nix shell`
        devShell = pkgs.mkShell {
          # add things you want in your shell here
          nativeBuildInputs = with pkgs; [pkg-config];
          buildInputs = with pkgs; [
            nodejs libsass nodePackages.node-gyp

          ];
        };
      }
    );
}
