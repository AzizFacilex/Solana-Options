use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use pyth_sdk_solana::load_price_feed_from_account_info;

declare_id!("your_program_id_here");

#[program]
pub mod solana_minute_options {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = ctx.accounts.authority.key();
        game_state.total_bets = 0;
        game_state.house_balance = 0;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        direction: BetDirection
    ) -> Result<()> {
        let clock = Clock::get()?;
        let game_state = &mut ctx.accounts.game_state;
        let bet = &mut ctx.accounts.bet;
        
        // Load SOL price from Pyth
        let price_feed = load_price_feed_from_account_info(&ctx.accounts.pyth_price_account)?;
        let current_price = price_feed.get_current_price().ok_or(ErrorCode::NoPriceFound)?;
        
        bet.owner = ctx.accounts.better.key();
        bet.amount = amount;
        bet.direction = direction;
        bet.timestamp = clock.unix_timestamp;
        bet.entry_price = current_price.price;
        bet.settled = false;
        
        game_state.total_bets += 1;
        
        // Transfer bet amount to program account
        // TODO: Implement transfer logic
        
        Ok(())
    }

    pub fn settle_bet(ctx: Context<SettleBet>) -> Result<()> {
        // Get price from Pyth Oracle
        let price_account = &ctx.accounts.pyth_price_feed;
        let price = pyth_client::cast::<Price>(price_account).get_price_unchecked();

        // Calculate price movement
        let round = &mut ctx.accounts.game_state;
        let price_change = price - round.entry_price;

        // Determine winners and payouts
        // ... payout logic with 1.9x multiplier ...
        // ... deduct 5% house fee ...
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BetDirection {
    Call,
    Put,
}

#[account]
pub struct GameState {
    pub authority: Pubkey,
    pub total_bets: u64,
    pub house_balance: u64,
}

#[account]
pub struct Bet {
    pub owner: Pubkey,
    pub amount: u64,
    pub direction: BetDirection,
    pub timestamp: i64,
    pub entry_price: i64,
    pub settled: bool,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(
        init,
        payer = better,
        space = 8 + 32 + 8 + 1 + 8 + 8 + 1
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub better: Signer<'info>,
    /// CHECK: This account is verified using Pyth SDK
    pub pyth_price_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No price found in Pyth price feed")]
    NoPriceFound,
} 