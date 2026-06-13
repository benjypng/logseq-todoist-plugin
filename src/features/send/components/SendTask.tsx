import './style.css'

import { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'

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
  label: string[]
  priority: string
  due: string
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
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    defaultValues: {
      task: content.trim(),
      project: '--- ---',
      label: [],
      priority: '',
      uuid: uuid,
      due: '',
    },
  })

  const submitTask = useCallback(
    (data: FormInput) => {
      sendTask(data)
      reset()
      logseq.hideMainUI()
    },
    [reset],
  )

  const labelOptions = labels.filter((label) => label !== '--- ---')

  return (
    <div className="td-overlay">
      <div className="td-card" id="send-task-container">
        <h2 className="td-title">Todoist: Send Task</h2>
        <span className="td-pill">{content}</span>

        <form onSubmit={handleSubmit(submitTask)} className="td-form">
          <Controller
            control={control}
            name="project"
            rules={{ required: 'Please select a project' }}
            render={({ field }) => (
              <label className="td-field">
                <span className="td-field-label">Project</span>
                <select {...field} className="td-select">
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
                {errors?.project?.message && (
                  <span className="td-error">{errors.project.message}</span>
                )}
              </label>
            )}
          />

          <Controller
            control={control}
            name="label"
            render={({ field }) => {
              const selected = field.value ?? []
              return (
                <div className="td-field">
                  <span className="td-field-label">Label</span>
                  <div className="td-checkbox-list">
                    {labelOptions.length === 0 ? (
                      <span className="td-muted">No labels</span>
                    ) : (
                      labelOptions.map((label) => (
                        <label key={label} className="td-checkbox">
                          <input
                            type="checkbox"
                            checked={selected.includes(label)}
                            onChange={(e) =>
                              field.onChange(
                                e.target.checked
                                  ? [...selected, label]
                                  : selected.filter((l) => l !== label),
                              )
                            }
                          />
                          <span>{label}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )
            }}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <label className="td-field">
                <span className="td-field-label">
                  Priority (1: normal, 4: urgent)
                </span>
                <select {...field} className="td-select">
                  <option value="" disabled>
                    Select Priority
                  </option>
                  {['1', '2', '3', '4'].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>
            )}
          />

          <Controller
            control={control}
            name="due"
            render={({ field }) => (
              <label className="td-field">
                <span className="td-field-label">Deadline</span>
                <input
                  {...field}
                  type="text"
                  className="td-input"
                  placeholder="Enter deadline (e.g. Next Monday)"
                />
              </label>
            )}
          />

          <button type="submit" className="td-button">
            Send Task
          </button>
        </form>
      </div>
    </div>
  )
}
