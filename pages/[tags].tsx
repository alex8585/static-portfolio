import React, { useEffect, useState, ChangeEvent } from 'react'

import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'

import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Grid from '@material-ui/core/Grid'

import Typography from '@material-ui/core/Typography'

import Container from '@material-ui/core/Container'

import Pagination from '@material-ui/core/Pagination'

import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'
import { wrapper } from '../store'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import { tagsSelectors, getTags } from '../features/tags/tagsSlice'
import {
  portfoliosSelectors,
  getPortfolios,
} from '../features/portfolios/portfoliosSlice'
import { calcPages } from '../utils/utils'
import Image from 'next/image'
import FrontendLayout from '../components/FrontendLayout'
import Head from 'next/head'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
import { useAppDispatch, useAppSelector } from '../hooks/store'

import { AnyAction } from '@reduxjs/toolkit'
import { NextPage } from 'next/types'

import useStyles from '../pages_styles/index'

import axios from 'axios'

import { useRouter } from 'next/router'
const API_URL = process.env.NEXT_PUBLIC_API_URL
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next'
const perPage = 6

type Props = {
  match: any
  location: any
  history: any
  staticTags: any
  tagsStr: string
}

const Index: NextPage<Props> = ({ tagsStr }) => {
  const classes = useStyles()

  const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN

  const dispatch = useAppDispatch()

  const router = useRouter()
  const portfoliosLoading = useAppSelector((state) => state.portfolios.loading)
  //const page = useAppSelector((state) => state.portfolios.page)

  const tags = useAppSelector(tagsSelectors.selectAll)
  const portfolios = useAppSelector(portfoliosSelectors.selectAll)
  const total = useAppSelector((state) => state.portfolios.total)
  const countPages = calcPages(perPage, total)
  const images: Array<string> = []

  const [page, setPage] = useState(1)

  // useEffect(() => {
  //   if(!tags.length) return
  //   dispatch(listPortfolios(1, 6, tags))
  // }, [dispatch, tags])
  const [isOpen, setIsOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [tagFilter, setTagFilter] = useState<number[]>([])

  useEffect(() => {
    if (tagsStr && tagsStr !== 'all') {
      const tmpTagsFilter = tagsStr.split(',').map((id) => parseInt(id))
      setTagFilter(tmpTagsFilter)
    }
  }, [tagsStr])

  const setCurrentImage = (index: number) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }

  const handletagFilter = async (id: number) => {
    const tmpTagFilter = [...tagFilter]
    const index = tmpTagFilter.indexOf(id as never)
    if (index !== -1) {
      tmpTagFilter.splice(index, 1)
    } else {
      tmpTagFilter.push(id as never)
    }
    setTagFilter(tmpTagFilter)

    let tagsStr = tmpTagFilter
      .sort(function (a, b) {
        return a - b
      })
      .join(',')
    //tagsStr = tagsStr ?? 'all'
    if (!tagsStr) {
      tagsStr = 'all'
    }
    router.push(`/${tagsStr}`)
    //dispatch(getPortfolios({ page: 1, perPage, tags: tmpTagFilter }))
  }

  // @ts-ignore
  const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value)
    //dispatch(getPortfolios({ page: value, perPage, tags: tagFilter }))
  }

  return (
    <FrontendLayout>
      <div>
        <Head>
          <title>Portfolio</title>
          <meta name="description" content="Welcome to alex85 portfolio page" />
        </Head>

        <Container
          maxWidth="sm"
          component="main"
          className={classes.heroContent}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Portfolio
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="textSecondary"
            component="p"
          ></Typography>
        </Container>
        <Container
          maxWidth="md"
          component="main"
          className={classes.heroContent}
        >
          {portfoliosLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size="80px" />
            </Box>
          )}
          {!portfoliosLoading && (
            <div>
              <ul className={classes.paper}>
                {[...tags].map((tag) => {
                  return (
                    <li
                      key={tag.id}
                      className={
                        tagFilter.includes(tag.id as never) ? 'active' : ''
                      }
                    >
                      <Chip
                        label={tag.name}
                        onClick={() => handletagFilter(tag.id)}
                        className={classes.chip}
                      />
                    </li>
                  )
                })}
              </ul>

              <Grid container spacing={5} alignItems="flex-end">
                {portfolios
                  .slice((page - 1) * perPage, page * perPage)
                  .map((portfolio, i) => {
                    const fullImg = portfolio.image
                      ? API_DOMAIN + portfolio.image
                      : ''
                    images.push(fullImg)

                    return (
                      <Grid item key={portfolio.name} xs={12} sm={6} md={4}>
                        <Card className={classes.card}>
                          <CardHeader
                            title={portfolio.name}
                            subheader=""
                            className={classes.cardHeader}
                          />
                          <Image
                            className={classes.image}
                            onClick={() => setCurrentImage(i)}
                            src={
                              portfolio.thumb
                                ? API_DOMAIN + portfolio.thumb
                                : ''
                            }
                            alt={portfolio.name}
                            width={300}
                            height={200}
                          />
                          <CardContent>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="p"
                            ></Typography>
                            <Paper component="ul" className={classes.paper}>
                              {[...portfolio.tags].map((tag) => {
                                return (
                                  <li key={tag.id}>
                                    <Chip
                                      label={tag.name}
                                      className={classes.chip}
                                    />
                                  </li>
                                )
                              })}
                            </Paper>
                            {portfolio.url.indexOf('github') !== -1 && (
                              <Button
                                target="_blank"
                                className={classes.button}
                                variant="contained"
                                color="secondary"
                                href={portfolio.url}
                              >
                                Github
                              </Button>
                            )}
                            {portfolio.url.indexOf('github') === -1 && (
                              <Button
                                target="_blank"
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                href={portfolio.url}
                              >
                                View
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
              </Grid>

              <div className={classes.paginatorContainer}>
                <Pagination
                  page={page}
                  count={countPages}
                  onChange={handleChangePage}
                  className={classes.pagination}
                />
              </div>
            </div>
          )}
        </Container>
        {isOpen && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => setIsOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex((photoIndex + images.length - 1) % images.length)
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % images.length)
            }
          />
        )}
      </div>
    </FrontendLayout>
  )
}
function getCombinations(valuesArray: string[]) {
  const combi = []
  let temp = []
  const slent = Math.pow(2, valuesArray.length)

  for (let i = 0; i < slent; i++) {
    temp = []
    for (let j = 0; j < valuesArray.length; j++) {
      if (i & Math.pow(2, j)) {
        temp.push(valuesArray[j])
      }
    }
    if (temp.length > 0) {
      combi.push(temp)
    }
  }

  combi.sort((a, b) => a.length - b.length)
  return combi
}

export async function getStaticPaths() {
  console.log('1111')

  //const tags = await getTags()
  const {
    data: { items },
  } = await axios.get(API_URL + '/tags')

  const ids = items.map((tag: any) => {
    return tag.id.toString()
  })

  const tags = getCombinations(ids)
  // const paths = items.map((tag: any) => {
  //   return { params: { tags: tag.id.toString() } }
  // })
  tags.push(['all'])
  const paths = tags.map((tag: any) => {
    return {
      params: {
        tags: tag
          .sort(function (a: string, b: string) {
            return parseInt(a) - parseInt(b)
          })
          .join(','),
      },
    }
  })

  // const p = [{ params: { tags: '10,11,12' } }]

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = wrapper.getStaticProps(
  (store) =>
    async ({ params: { tags } }: any) => {
      console.log('2222')
      // await new Promise((resolve) => setTimeout(resolve, 1000))
      await store.dispatch(getTags() as unknown as AnyAction)
      let tagFilter: [] = tags?.split(',')
      if (tags == 'all') {
        tagFilter = []
      }

      await store.dispatch(
        getPortfolios({
          page: 1,
          perPage: 9999,
          tags: tagFilter,
        }) as unknown as AnyAction
      )
      return {
        props: {
          tagsStr: tags,
        },
        revalidate: false,
      }
    }
)

export default Index
