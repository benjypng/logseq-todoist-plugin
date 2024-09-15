import './style.css'
import '@mantine/core/styles.css'

import {
  Button,
  Flex,
  MantineProvider,
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

interface SendTaskProps {
  content: string
  projects: string[]
  labels: string[]
  uuid: string
}

interface FormInput {
  task: string
  project: string
  label: string
  priority: string
  due: string
}

export const SendTask = ({
  content,
  projects,
  labels,
  uuid,
}: SendTaskProps) => {
  const { control, watch, handleSubmit } = useForm<FormInput>({
    defaultValues: {
      task: content.trim(),
      project: '',
      label: '',
      due: '',
    },
  })

  const submitTask = useCallback(
    (data: FormInput) => {
      console.log(data)
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
          <Pill size="xl" color="darkteal">
            {content}
          </Pill>
          <Space h="1rem" />
          <form onSubmit={handleSubmit(submitTask)}>
            <Stack gap="1rem">
              <Controller
                control={control}
                name="project"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Project"
                    placeholder="Project"
                    data={projects}
                  />
                )}
              />
              <Controller
                control={control}
                name="label"
                render={({ field }) => (
                  <Select {...field} label="Label" data={labels} />
                )}
              />
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Priority (1: normal, 4: urgent)"
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
