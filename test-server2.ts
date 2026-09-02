console.log("Loading express");
import express from "express";
console.log("Loading vite");
import { createServer as createViteServer } from "vite";
console.log("Loading db");
import { db } from "./src/db/index.js";
console.log("All imported");
