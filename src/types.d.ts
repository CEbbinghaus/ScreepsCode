import { LoDashStatic } from "lodash";

declare global {
	var _: LoDashStatic;

	interface CreepMemory {
		role: string;
		charge: boolean;
		upgrading: boolean;
		exploreState: string;
		repairing?: string;
		build: boolean;
	}
	
	interface Memory {
		structures: Record<string, string[]>
	}
}
