import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import ConversationContainer from './ConversationContainer.js';
import { postConversation, getMessages } from '../apiCalls.js';
jest.mock('../apiCalls.js');

describe('ConversationContainer', () => {
  let mockConversations;

  beforeEach(() => {
    mockConversations = [
      {
          conversation_id: 1,
          start_date: '2021-02-13 17:29:44.708606-07',
          title: 'Bernese Mountain Dogs'
        },
        {
          conversation_id: 2,
          start_date: '2021-02-12 17:29:44.708606-07',
          title: 'Turing'
        }
    ]

    getMessages.mockResolvedValue([
      {
        message_id: 1,
        text: 'I like the beach, but prefer mountains.',
        date_sent: '2021-02-13 17:29:44.708606-07',
        time_sent: null,
        conversation_id: 3
      }  
    ])

    postConversation.mockResolvedValue({
      conversation_id: 3,
      start_date: '2021-02-11 17:29:44.708606-07',
      title: 'East Coast'     
    })
  })

  it('should render expected elements', async () => {
    await act(async () => {
      await render(
        <ConversationContainer 
          conversations={mockConversations}
        />
      )
    })

    expect(screen.getByText('Let\'s Start a Conversation...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('title')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'SUBMIT'})).toBeInTheDocument();
    expect(screen.getByText('Existing Conversations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('search by title...')).toBeInTheDocument();
    const title = await waitFor(() => screen.getByText('Turing'));
    expect(title).toBeInTheDocument();
  })

  it('should be able to create new conversations', async () => {
    await act(async () => {
      await render(
        <ConversationContainer 
          conversations={mockConversations}
        />
      )
    })
    
    const input = screen.getByPlaceholderText('title');
    const button = screen.getByRole('button', {name: 'SUBMIT'});
    userEvent.type(input, 'East Coast');
    expect(input).toHaveValue('East Coast');
    await waitFor(() => userEvent.click(button));
    expect(input).toHaveValue('');
  })

  it('should be able to search conversations by title', async () => {
    await act(async () => {
      await render(
        <ConversationContainer 
          conversations={mockConversations}
        />
      )
    })

    const input = screen.getByPlaceholderText('search by title...');

    userEvent.type(input, 'Bernese');
    expect(input).toHaveValue('Bernese');
    const match1 = await waitFor(() => screen.getByText('Bernese Mountain Dogs'));
    expect(match1).toBeInTheDocument();
    expect(screen.queryByText('Turing')).toBeNull();
  })

  it('should be able to search without case sensitivity', async () => {
    await act(async () => {
      await render(
        <ConversationContainer 
          conversations={mockConversations}
        />
      )
    })

    const input = screen.getByPlaceholderText('search by title...');

    userEvent.type(input, 'turi');
    expect(input).toHaveValue('turi');
    const match2 = await waitFor(() => screen.getByText('Turing'));
    expect(match2).toBeInTheDocument();
    expect(screen.queryByText('Bernese Mountain Dogs')).toBeNull(); 
  })
})