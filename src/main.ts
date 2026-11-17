import { isValidSummary } from './validation';

const ticket = {
  id: 'T100',
  messages: [
    {
      id: 'm1',
      text: 'Customer reports a duplicate payment.',
    },
    {
      id: 'm2',
      text: 'Support is investigating the payment.',
    },
  ],
};

// Create the dashboard.
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app element in index.html');
}

app.innerHTML = `
  <h1>Support Dashboard</h1>

  <h2 id="ticket-title"></h2>
  <ul id="messages"></ul>

  <button id="generate" type="button">
    Generate summary
  </button>

  <button id="retry" type="button" hidden>
    Retry
  </button>

  <p id="status" role="status" aria-live="polite"></p>

  <h2>Generated summary</h2>
  <p id="summary"></p>

  <button id="approve" type="button" disabled>
    Approve
  </button>
`;

// Get dashboard elements.
const ticketTitle =
  document.querySelector<HTMLHeadingElement>('#ticket-title')!;

const messagesElement =
  document.querySelector<HTMLUListElement>('#messages')!;

const generateButton =
  document.querySelector<HTMLButtonElement>('#generate')!;

const retryButton =
  document.querySelector<HTMLButtonElement>('#retry')!;

const approveButton =
  document.querySelector<HTMLButtonElement>('#approve')!;

const statusElement =
  document.querySelector<HTMLParagraphElement>('#status')!;

const summaryElement =
  document.querySelector<HTMLParagraphElement>('#summary')!;

// Display ticket data safely.
ticketTitle.textContent = `Ticket: ${ticket.id}`;

for (const message of ticket.messages) {
  const item = document.createElement('li');
  item.textContent = `${message.id}: ${message.text}`;
  messagesElement.appendChild(item);
}

// IDs allowed in summary citations.
const ticketMessageIds = new Set(
  ticket.messages.map(message => message.id),
);

let isGenerating = false;
let canApprove = false;

// Identify the insufficient-information response.
function isInsufficientInformation(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return data.status === 'insufficient_information';
}

// Generate a summary or retry after a service failure.
async function generateSummary(): Promise<void> {
  if (isGenerating) {
    return;
  }

  isGenerating = true;
  canApprove = false;

  approveButton.disabled = true;
  generateButton.disabled = true;

  retryButton.disabled = true;
  retryButton.hidden = true;

  summaryElement.textContent = '';
  statusElement.textContent = 'Generating summary...';

  try {
    const response = await fetch(
      `/api/tickets/${ticket.id}/summary`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Service returned ${response.status}`);
    }

    const data: unknown = await response.json();

    if (isInsufficientInformation(data)) {
      statusElement.textContent = 'Insufficient information.';
      return;
    }

    if (!isValidSummary(data, ticketMessageIds)) {
      statusElement.textContent =
        'Invalid summary or citations. Approval is blocked.';
      return;
    }

    // Display generated content as plain text.
    summaryElement.textContent = data.summary;

    canApprove = true;
    approveButton.disabled = false;

    statusElement.textContent =
      'Summary is valid. Ready for approval.';
  } catch {
    // Approval remains disabled after any failure.
    canApprove = false;
    approveButton.disabled = true;

    statusElement.textContent =
      'Generation failed. Please retry.';

    retryButton.hidden = false;
  } finally {
    isGenerating = false;
    generateButton.disabled = false;
    retryButton.disabled = false;
  }
}

// Local approval feedback; no persistence is implemented.
function approveSummary(): void {
  if (!canApprove || isGenerating) {
    return;
  }

  canApprove = false;
  approveButton.disabled = true;

  statusElement.textContent = 'Summary approved.';
}

// Connect buttons to their actions.
generateButton.addEventListener('click', generateSummary);
retryButton.addEventListener('click', generateSummary);
approveButton.addEventListener('click', approveSummary);