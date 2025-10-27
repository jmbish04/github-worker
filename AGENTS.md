# 🤖 Agent Architecture — Cloudflare Worker GitHub Proxy

This document defines the modular agent framework for building, maintaining, and extending the **Cloudflare Worker GitHub Proxy**.  
Each agent owns a distinct layer of the stack, ensuring that AI or human collaborators can work independently without stepping on one another.

--- 

## 🧩 System Overview

The Worker is an **Octokit-backed proxy** deployed on Cloudflare, using Hono, Zod, and Octokit to proxy GitHub REST and GraphQL APIs.
