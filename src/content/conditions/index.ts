import type { Condition } from "../types";
import { acne } from "./acne";
import { erectileDysfunction } from "./erectile-dysfunction";
import { hairLoss } from "./hair-loss";

export const conditions: Condition[] = [hairLoss, acne, erectileDysfunction];
