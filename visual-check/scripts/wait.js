// Waits for post-render data. Exits non-zero with one line on timeout.
export async function waitForReady(page, { wait, settled }) {
    const steps = [];
    if (wait) steps.push([wait, page.locator(wait).first(), 'visible']);
    if (settled) steps.push(['[aria-busy="true"] to clear', page.locator('[aria-busy="true"]').first(), 'hidden']);
    for (const [what, loc, state] of steps) {
        try {
            await loc.waitFor({ state, timeout: 10000 });
        } catch {
            console.error(`Timed out after 10s waiting for "${what}"`);
            await page.context().browser()?.close();
            process.exit(1);
        }
    }
}
