import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createFeed, deleteFeed, getFeeds, patchFeed, searchFeed } from '../api/feeds-api'
import Auth from '../auth/Auth'
import { Feed } from '../types/Feed'

interface FeedsProps {
  auth: Auth
  history: History
}

interface FeedsState {
  feeds: Feed[]
  newFeedName: string
  searchString: string
  loadingFeeds: boolean
}

export class Feeds extends React.PureComponent<FeedsProps, FeedsState> {
  state: FeedsState = {
    feeds: [],
    newFeedName: '',
    searchString: '',
    loadingFeeds: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFeedName: event.target.value })
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchString: event.target.value })
  }

  onEditButtonClick = (feedId: string) => {
    this.props.history.push(`/feeds/${feedId}/edit`)
  }

  onFeedSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const feed = await searchFeed(this.props.auth.getIdToken(), this.state.searchString)
      if(feed.length == 0) {
        alert('No feed found')
        return
      }
      this.setState({
        feeds: feed,
        newFeedName: ''
      })
    } catch {
      alert('Feed search failed')
    }
  }

  onFeedCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newFeed = await createFeed(this.props.auth.getIdToken(), {
        itemName: this.state.newFeedName,
        dueDate
      })
      this.setState({
        feeds: [...this.state.feeds, newFeed],
        newFeedName: ''
      })
    } catch {
      alert('Feed creation failed')
    }
  }

  onFeedDelete = async (feedId: string) => {
    try {
      await deleteFeed(this.props.auth.getIdToken(), feedId)
      this.setState({
        feeds: this.state.feeds.filter(feed => feed.feedId !== feedId)
      })
    } catch {
      alert('Feed deletion failed')
    }
  }

  onFeedCheck = async (pos: number) => {
    try {
      const feed = this.state.feeds[pos]
      await patchFeed(this.props.auth.getIdToken(), feed.feedId, {
        itemName: feed.itemName,
        dueDate: feed.dueDate,
        done: !feed.done
      })
      this.setState({
        feeds: update(this.state.feeds, {
          [pos]: { done: { $set: !feed.done } }
        })
      })
    } catch {
      alert('Feed deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const feeds = await getFeeds(this.props.auth.getIdToken())
      this.setState({
        feeds,
        loadingFeeds: false
      })
    } catch (e) {
      alert(`Failed to fetch feeds: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Final Project</Header>

        {this.renderCreateFeedInput()}

        {this.renderSearchFeedInput()}
        
        {this.renderFeeds()}
      </div>
    )
  }

  renderCreateFeedInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onFeedCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderFeeds() {
    if (this.state.loadingFeeds) {
      return this.renderLoading()
    }

    return this.renderFeedsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading data
        </Loader>
      </Grid.Row>
    )
  }

  renderSearchFeedInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'orange',
              labelPosition: 'left',
              icon: 'add',
              content: 'Search feed',
              onClick: this.onFeedSearch
            }}
            fluid
            actionPosition="left"
            placeholder="Input feed name..."
            onChange={this.handleSearchChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderFeedsList() {
    return (
      <Grid padded>
        {this.state.feeds.map((feed, pos) => {
          return (
            <Grid.Row key={feed.feedId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onFeedCheck(pos)}
                  checked={feed.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {feed.itemName}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {feed.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(feed.feedId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onFeedDelete(feed.feedId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {feed.attachmentUrl && (
                <Image src={feed.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
