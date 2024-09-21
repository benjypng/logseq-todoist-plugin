import './style.css'
import '@mantine/core/styles.css'

import {
  Button,
  Flex,
  MantineProvider,
  MultiSelect,
  Pill,
  Select,
  Space,
  Stack,
  TextInput,
  Title,
} from '@mantine/core'
import { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { THEME } from '../../../constants'
import { sendTask } from '..'

interface SendTaskProps {
  content: string
  projects: string[]
  labels: string[]
  uuid: string
}

export interface FormInput {
  task: string
  project: string
  label?: string[]
  priority?: string
  due?: string
  uuid: string
}

export const SendTask = ({
  content,
  projects,
  labels,
  uuid,
}: SendTaskProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    defaultValues: {
      task: content.trim(),
      uuid: uuid,
      due: '',
    },
  })

  const submitTask = useCallback(
    (data: FormInput) => {
      sendTask(data)
      logseq.UI.showMsg('Task sent to Todoist', 'success', { timeout: 3000 })
      logseq.hideMainUI()
    },
    [uuid],
  )

  return (
    <MantineProvider theme={THEME}>
      <Flex bg="none" justify="right" p="md">
        <Flex
          p="md"
          mt="xl"
          bg="white"
          w="20rem"
          direction="column"
          id="send-task-container"
        >
          <Title fz="md">Todoist: Send Task</Title>
          <Pill size="xl" color="darkteal" my="0.5rem">
            {content}
          </Pill>
          <Space h="1rem" />
          <form onSubmit={handleSubmit(submitTask)}>
            <Stack gap="1rem">
              <Controller
                control={control}
                name="project"
                rules={{ required: 'Please select a project' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Project"
                    placeholder="Select Project"
                    data={projects}
                    error={errors?.project?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="label"
                render={({ field }) => (
                  <MultiSelect
                    {...field}
                    label="Label"
                    placeholder="Select Label"
                    data={labels}
                  />
                )}
              />
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Priority (1: normal, 4: urgent)"
                    placeholder="Select Priority"
                    data={['1', '2', '3', '4']}
                  />
                )}
              />
              <Controller
                control={control}
                name="due"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Deadline"
                    placeholder="Enter deadline (e.g. Next Monday)"
                  />
                )}
              />
            </Stack>
            <Space h="1rem" />
            <Button type="submit" size="xs">
              Send Task
            </Button>
          </form>
        </Flex>
      </Flex>
    </MantineProvider>
  )
}
