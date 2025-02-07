import { BattlerIndex } from "#app/battle";
import { Abilities } from "#app/enums/abilities";
import { Moves } from "#app/enums/moves";
import { Species } from "#app/enums/species";
import GameManager from "#test/utils/gameManager";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("Moves - Freeze-Dry", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;
  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override
      .battleType("single")
      .enemySpecies(Species.MAGIKARP)
      .enemyAbility(Abilities.BALL_FETCH)
      .enemyMoveset(Moves.SPLASH)
      .starterSpecies(Species.FEEBAS)
      .ability(Abilities.BALL_FETCH)
      .moveset([ Moves.FREEZE_DRY ]);
  });

  it("should deal 2x damage to pure water types", async () => {
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.FREEZE_DRY);
    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(2);
  });

  it("should deal 4x damage to water/flying types", async () => {
    game.override.enemySpecies(Species.WINGULL);
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.FREEZE_DRY);
    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(4);
  });

  it("should deal 1x damage to water/fire types", async () => {
    game.override.enemySpecies(Species.VOLCANION);
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.FREEZE_DRY);
    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(1);
  });

  /**
   * Freeze drys forced super effectiveness should overwrite wonder guard
   */
  it("should deal 2x dmg against soaked wonder guard target", async () => {
    game.override
      .enemySpecies(Species.SHEDINJA)
      .enemyMoveset(Moves.SPLASH)
      .starterSpecies(Species.MAGIKARP)
      .moveset([ Moves.SOAK, Moves.FREEZE_DRY ]);
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.SOAK);
    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.toNextTurn();

    game.move.select(Moves.FREEZE_DRY);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(2);
    expect(enemy.hp).toBeLessThan(enemy.getMaxHp());
  });

  // enable if this is ever fixed (lol)
  it.todo("should deal 2x damage to water types under Normalize", async () => {
    game.override.ability(Abilities.NORMALIZE);
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.FREEZE_DRY);
    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(2);
  });

  // enable once Electrify is implemented (and the interaction is fixed, as above)
  it.todo("should deal 2x damage to water types under Electrify", async () => {
    game.override.enemyMoveset([ Moves.ELECTRIFY ]);
    await game.classicMode.startBattle();

    const enemy = game.scene.getEnemyPokemon()!;
    vi.spyOn(enemy, "getMoveEffectiveness");

    game.move.select(Moves.FREEZE_DRY);
    await game.setTurnOrder([ BattlerIndex.ENEMY, BattlerIndex.PLAYER ]);
    await game.phaseInterceptor.to("BerryPhase");

    expect(enemy.getMoveEffectiveness).toHaveReturnedWith(2);
  });
});
