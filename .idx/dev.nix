
{ pkgs, ... }: {
  # Let Nix manage dependencies for you.
  packages = [
    pkgs.go_1_22
    pkgs.nodejs_20
  ];
}
