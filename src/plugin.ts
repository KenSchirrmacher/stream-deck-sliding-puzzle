import streamDeck from "@elgato/streamdeck";
import { TileAction } from "./actions/tile.js";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new TileAction());

streamDeck.connect();
