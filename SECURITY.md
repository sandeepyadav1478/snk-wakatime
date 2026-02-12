# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| v1.x    | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a private vulnerability report via GitHub's [security advisories](https://github.com/sandeepyadav1478/snk-wakatime/security/advisories).

## Token Handling

This action accepts a `github_token` input. The token is only used to fetch GitHub contribution data via the GitHub GraphQL API. It is never logged, stored, or transmitted to any third-party service.

When using `wakatime_json_url`, only a public (unauthenticated) HTTP GET request is made to the WakaTime share URL. No tokens are sent to WakaTime.
