import { Warrior, FlaggedWarrior } from '../models/types';
import { WarriorService } from '../services/WarriorService';

export class WarriorController {
  private warriorService: WarriorService;

  constructor() {
    this.warriorService = new WarriorService();
  }

  async getAllWarriors(): Promise<Warrior[]> {
    return this.warriorService.getAllWarriors();
  }

  async getFlaggedWarriors(): Promise<FlaggedWarrior[]> {
    return this.warriorService.getFlaggedWarriors();
  }

  async getWarriorById(id: number): Promise<Warrior | null> {
    return this.warriorService.getWarriorById(id);
  }

  async clearFlag(warriorId: number): Promise<void> {
    return this.warriorService.clearFlag(warriorId);
  }

  async suspendWarrior(warriorId: number): Promise<void> {
    return this.warriorService.suspendWarrior(warriorId);
  }
}